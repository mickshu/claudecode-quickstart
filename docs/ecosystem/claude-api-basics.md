---
title: Claude API 基础
description: 模型 ID、消息格式、SDK 入门
lastVerified: 2026-05
---

# Claude API 基础

> Claude API(也称 Anthropic API)是直接和 Claude 模型对话的 HTTP 接口。**Agent SDK 与 Claude Code 都构建在它之上**。

## 何时直接用 API

- **轻量集成**:发个 prompt 拿结果,不需要 agent loop
- **批处理**:Batch API 大规模异步任务
- **自定义 agent loop**:对工具调用有特殊需求,不用 Agent SDK

否则:用 [Agent SDK](./agent-sdk-intro)。

## 当前模型 ID

| 模型 | ID | 别名 | 推荐场景 |
| --- | --- | --- | --- |
| Opus 4.7 | `claude-opus-4-7` | `opus` | 重思考、复杂决策 |
| Sonnet 4.6 | `claude-sonnet-4-6` | `sonnet` | 日常主力 |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | `haiku` | 批量轻任务 |

::: tip 旧模型替换
之前的 4.5 / 4.6 系列仍可用一段时间。新项目建议直接用 4.7 / 4.6 / 4.5(各档最新)。
迁移指南见 [跨模型版本迁移](./migration)。
:::

## TypeScript SDK

```bash
npm i @anthropic-ai/sdk
```

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();   // 自动读取 ANTHROPIC_API_KEY

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: '用一句中文回答',
  messages: [
    { role: 'user', content: '一加一等于几?' }
  ]
});

console.log(response.content[0].text);
```

## Python SDK

```bash
pip install anthropic
```

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="用一句中文回答",
    messages=[{"role": "user", "content": "一加一等于几?"}]
)

print(response.content[0].text)
```

## Messages API 请求结构

```jsonc
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": [
    {
      "type": "text",
      "text": "(可缓存的长系统 prompt)",
      "cache_control": { "type": "ephemeral" }
    }
  ],
  "messages": [
    { "role": "user", "content": "你的输入" },
    { "role": "assistant", "content": "上一轮的回答" },
    { "role": "user", "content": "本轮输入" }
  ],
  "tools": [/* tool definitions */],
  "tool_choice": { "type": "auto" },
  "stream": true,
  "thinking": { "type": "enabled", "budget_tokens": 8192 }
}
```

## 流式

```ts
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: '...' }]
});

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text ?? '');
  }
}
```

## Tool use(让模型调工具)

```ts
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools: [{
    name: 'get_weather',
    description: '查询某城市天气',
    input_schema: {
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city']
    }
  }],
  messages: [{ role: 'user', content: '北京今天天气?' }]
});

// response.content 可能含 tool_use block
for (const block of response.content) {
  if (block.type === 'tool_use') {
    const result = await callMyWeatherAPI(block.input.city);
    // 把 tool_result 作为下一轮 user message 回传
    // ...
  }
}
```

完整 tool loop 实现见 Agent SDK,这里只是骨架。

## 错误码与重试

| 状态码 | 含义 | 处理 |
| --- | --- | --- |
| `400` | 请求格式错 | 修请求,不要重试 |
| `401` | 鉴权失败 | 检查 API key |
| `403` | 权限不足 | 检查模型可用性 / 额度 |
| `429` | 限流 / 配额 | 指数退避,SDK 内置 |
| `500` / `503` / `529` | 服务端错 / 过载 | 退避重试 |

SDK 默认 2-4 次自动重试。生产环境也要在应用层加 backoff + 失败上报。

## API key 管理

| 场景 | 做法 |
| --- | --- |
| 本机开发 | `~/.zshrc` export 或 1Password CLI |
| Node 服务 | env var 注入,不要写代码里 |
| Web 前端 | **永远不要** 把 API key 暴露在前端 —— 走自己的后端代理 |
| CI | secret store(GitHub Secrets / GitLab CI variables) |

## 第三方部署 endpoint

```ts
const client = new Anthropic({
  baseURL: 'https://your-proxy.example.com/anthropic',
  apiKey: process.env.PROXY_TOKEN
});
```

或用环境变量 `ANTHROPIC_BASE_URL`。Bedrock / Vertex / Foundry 各自有专门 SDK 入口。

## 接下来

→ [Prompt Caching](./prompt-caching)
