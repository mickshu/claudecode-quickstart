---
title: Tool Use 与扩展思考
description: tool_use、扩展思考、批处理、文件、引用
lastVerified: 2026-05
---

# Tool Use 与扩展思考

## Tool use:让模型调你写的工具

### 三步循环

```
1. 你给 API 发请求,带 tools 定义和 messages
2. 模型决定:文本回答,or 调用某个工具(返回 tool_use block)
3. 你执行工具,把结果作为 tool_result 拼到下一条 user message,继续循环
```

### 最小 tool 定义

```ts
{
  name: "get_user",
  description: "根据 user id 查询用户信息",
  input_schema: {
    type: "object",
    properties: {
      user_id: { type: "string", description: "用户唯一 ID" }
    },
    required: ["user_id"]
  }
}
```

### 完整 loop 骨架(TypeScript)

```ts
const messages = [{ role: "user", content: "查一下 user_42 的信息" }];

while (true) {
  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [getUserTool],
    messages
  });

  if (resp.stop_reason !== "tool_use") {
    console.log(resp.content[0].text);
    break;
  }

  // 把模型这一轮的 assistant message 拼回去
  messages.push({ role: "assistant", content: resp.content });

  // 处理每个 tool_use
  const toolResults = [];
  for (const block of resp.content) {
    if (block.type === "tool_use") {
      const result = await dispatch(block.name, block.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }
  }
  messages.push({ role: "user", content: toolResults });
}
```

### `tool_choice`

控制模型一定要 / 不要调用工具:

| `tool_choice` | 行为 |
| --- | --- |
| `{"type": "auto"}` | 模型自由决定(默认) |
| `{"type": "any"}` | **必须调一个**工具(不限名) |
| `{"type": "tool", "name": "X"}` | 必须调具体某个工具 |
| `{"type": "none"}` | 不允许工具调用 |

### Schema 越严越好

模型会"努力"贴近 schema。给 enum / pattern / format / minimum / maximum:

```jsonc
{
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["open", "closed"] },
    "limit": { "type": "integer", "minimum": 1, "maximum": 100 }
  },
  "required": ["status"]
}
```

## 扩展思考(Extended Thinking)

> 让模型在回答前**生成一段内部推理**(thinking 块),用更长链路推导答案。

### 何时该开

- 复杂数学 / 算法 / 推理
- 长程规划 / 跨多步决策
- 需要严谨自检的代码 / 配置

### 何时不该开

- 简单事实查询
- 流式产物(thinking 段会延迟首字节)
- 成本敏感场景(thinking 占 output token)

### 启用

```jsonc
{
  "model": "claude-opus-4-7",
  "thinking": {
    "type": "enabled",
    "budget_tokens": 8192
  },
  "max_tokens": 16384
}
```

`budget_tokens` 是上限,模型可以用得少。**`max_tokens` 必须 ≥ `budget_tokens` + 实际回答**。

### 输出形态

response.content 会含 `thinking` block:

```jsonc
[
  { "type": "thinking", "thinking": "...内部推理..." },
  { "type": "text", "text": "...最终回答..." }
]
```

UI 中可以选择性展示。

### 与 caching 的交互

thinking 内容**会**计入 cache_write / cache_read,长链路场景命中率高时省得多。

## Batch API

> 大量异步任务一次性提交,**24 小时内完成,价格折扣**(以官方价为准)。

### 用例

- 大规模评测
- 批量内容审核
- 数据集预处理

### 形状

```ts
const batch = await client.messages.batches.create({
  requests: [
    { custom_id: "1", params: { model: "claude-haiku-4-5-20251001", ... } },
    { custom_id: "2", params: { ... } },
    // ... 上万条
  ]
});

// 轮询
const status = await client.messages.batches.retrieve(batch.id);
if (status.processing_status === "ended") {
  for await (const result of client.messages.batches.results(batch.id)) {
    console.log(result.custom_id, result.result);
  }
}
```

实时性差但单价低,适合**离线**任务。

## Files API

把大文件上传一次,后续请求引用:

```ts
const file = await client.files.create({
  file: fs.createReadStream("./report.pdf")
});

await client.messages.create({
  model: "claude-sonnet-4-6",
  messages: [{
    role: "user",
    content: [
      { type: "document", source: { type: "file", file_id: file.id } },
      { type: "text", text: "总结这份 PDF" }
    ]
  }]
});
```

避免每次请求重传同一个大文件。

## Citations(引用)

让模型在长文回答中**标注来源段落**:

```ts
messages: [{
  role: "user",
  content: [
    {
      type: "document",
      source: { type: "text", data: longArticle },
      title: "原文",
      citations: { enabled: true }
    },
    { type: "text", text: "总结这篇文章并标注引用" }
  ]
}]
```

response.content 中会含 `citations` 字段指向原文 char 区间。适合 RAG / 知识库 / 法律金融场景。

## 接下来

→ [跨模型版本迁移](./migration)
