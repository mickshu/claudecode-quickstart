---
title: Prompt Caching
description: 命中策略、cache breakpoint、成本影响
lastVerified: 2026-05
---

# Prompt Caching

## 一句话

> 把可以复用的 prompt 前缀**显式标记**为可缓存,Claude 会把它存 5 分钟。下次同前缀的请求,**只算 cache_read 费用(约为 input 的 1/10)**。

## 何时一定要开

- **长系统 prompt**(几 K tokens):如 Agent SDK 内置的 system 段、Claude Code 的工具说明
- **大文档塞进 context**(RAG 之外的"超大上下文"应用)
- **历史会话很长** 的对话型应用

不开 = 每次重新算 input。在 Claude Code 这种"系统 prompt 几万 token"的客户端,cache 关掉相当于成本 ×10。

## 工作机制

```
请求体:
  system: [大段稳定内容] ← cache_control: ephemeral
  messages:
    - 历史 1
    - 历史 2 ← cache_control: ephemeral(可选第二个 breakpoint)
    - 历史 3
    - 当前用户输入

第一次:
  cache_creation_input_tokens = 大段
  cache_read_input_tokens = 0
  → 全价

第二次(5 分钟内):
  cache_creation_input_tokens = 0
  cache_read_input_tokens = 大段
  → 1/10 价
```

## TTL 与续约

- 默认 TTL **5 分钟**(API 返回 `cache_creation.ttl`)
- 每次命中**自动续约 5 分钟**
- 长会话连续请求时,cache 一直续命

## Breakpoint 放置原则

最多 4 个 cache breakpoint(以版本为准)。常见放置:

```
[ system: 角色 + 工具说明 ]   ← breakpoint #1(最稳定)
[ examples / 长文档 ]         ← breakpoint #2(偶尔变)
[ 历史消息 ... ]              ← breakpoint #3(每轮新增)
[ 当前用户输入 ]              ← 不需要 breakpoint
```

**规则**:`cache_control` 标在哪个 block,**该 block 及之前的所有内容**作为缓存键。

## 命中率观测

每次响应的 `usage` 字段:

```json
{
  "input_tokens": 30,
  "cache_creation_input_tokens": 0,
  "cache_read_input_tokens": 4520,
  "output_tokens": 156
}
```

**理想**:`cache_read` 占 input 的 80%+。

如果命中率低,常见原因:

- system prompt 频繁变(被插入了时间戳 / 用户名等动态信息)
- 历史消息没保持顺序一致
- 跨用户共享 cache 键设错(比如把 user id 放到 cache 段里)

## 与 Claude Code 的关系

Claude Code CLI 默认开 caching,你能做的:

```jsonc
// settings.json
{ "env": { "DISABLE_PROMPT_CACHING": "0" } }   // 默认就是开
```

`/cost` 输出会显示当前会话的 cache hit 数据。

## 应用层最佳实践

### 1. 把不变的东西放最前

```ts
{
  system: [
    { type: 'text', text: STATIC_SYSTEM },   // 一万年不变
    { type: 'text', text: APP_INSTRUCTIONS, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: USER_PROFILE }     // 这个变,放后面
  ]
}
```

### 2. 跨用户共享通用前缀

如果 1000 个用户共用同一段长 system prompt,把它放最前并打 cache_control,**所有人共享缓存**。Claude Code 提供 `--exclude-dynamic-system-prompt-sections` 启用这种模式。

### 3. 不要在 cache 段里塞动态内容

```
❌ system: ["你好 ${userName},今天是 ${date}", cache: ephemeral]
✅ system: ["你好,助手。", cache: ephemeral]
   first user msg: "我是 ${userName},今天是 ${date}"
```

### 4. 历史消息也可缓存

长对话:在最后一条历史消息上加 `cache_control`,让前面的全部进 cache。

```ts
messages: [
  { role: 'user', content: '...' },
  { role: 'assistant', content: '...' },
  { role: 'user', content: '...' },
  { role: 'assistant', content: '...', cache_control: { type: 'ephemeral' } },
  { role: 'user', content: NEW_MESSAGE }
]
```

## 成本估算

- **Cache write**:略贵于普通 input(约 1.25x)
- **Cache read**:**约 1/10 普通 input**
- 命中 1 次就回本;命中 N 次,省 (N-1)/10 倍

意思是:缓存即使只命中 2-3 次也已经划算。**不要因为"可能不命中"而不开**。

## 反模式

❌ **不开 caching**(默认开,主动关只是脚枪)

❌ **每次请求都把整个对话历史从头塞**,但**没有标 cache_control**

❌ **把 cache breakpoint 放在频繁变化的内容前**

❌ **system prompt 里塞 `Date.now()`** —— 每秒都失效

❌ **用大量小请求 + 都在 5 分钟外** —— 永远命不中。考虑合并请求或加保活心跳

## 接下来

→ [Tool Use 与扩展思考](./tool-use-and-thinking)
