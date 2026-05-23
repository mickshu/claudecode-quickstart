---
title: Agent SDK 构建实战
description: 用 SDK 构建一个最小可运行 agent
lastVerified: 2026-05
---

# Agent SDK 构建实战

::: warning API 仍在迭代
本章给出**典型形状**的伪代码示例。`@anthropic-ai/claude-agent-sdk` 的具体导入名、构造函数、生命周期方法会随版本调整,**实际编码以官方 [docs.claude.com](https://docs.claude.com/) 与 npm package readme 为准**。
:::

## 项目脚手架

```bash
mkdir my-agent && cd my-agent
npm init -y
npm i @anthropic-ai/claude-agent-sdk @anthropic-ai/sdk
npm i -D typescript tsx @types/node
npx tsc --init --target esnext --module nodenext --moduleResolution nodenext --strict
```

`package.json` 加 script:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts"
  }
}
```

## 最小可运行 agent

`src/index.ts`:

```ts
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  model: 'claude-sonnet-4-6',
  systemPrompt: `
    你是一个简洁的命令行助手。
    用工具读取本地文件。
    回答必须不超过 3 句话。
  `,
  tools: [
    {
      name: 'read_file',
      description: '读取本地文件',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string' } },
        required: ['path']
      },
      handler: async ({ path }) => {
        const fs = await import('node:fs/promises');
        return await fs.readFile(path, 'utf-8');
      }
    }
  ],
  // 启用 prompt caching(默认开启,这里显式表达)
  cache: { enabled: true }
});

const stream = agent.run({
  input: '看一下 ./package.json,告诉我项目名是什么'
});

for await (const event of stream) {
  if (event.type === 'text') process.stdout.write(event.delta);
  if (event.type === 'tool_use') console.error(`\n[tool] ${event.name}`);
}
```

跑:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

## 关键模式

### 1. Prompt caching(必带)

> Anthropic 鼓励所有基于 SDK 构建的应用**默认开启 prompt caching**。它能把成本降到 1/10 量级。

```ts
const agent = new Agent({
  // ...
  systemPrompt: { content: longSystemPrompt, cache: true },
  // 或在工具列表 / 历史消息上设置 cache breakpoint
});
```

详见 [Prompt Caching](./prompt-caching)。

### 2. 工具的输入校验

工具 `inputSchema` 越严格,模型越少传错参数:

```ts
{
  name: 'execute_query',
  inputSchema: {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'Postgres SQL,必须以 SELECT 开头' },
      limit: { type: 'integer', minimum: 1, maximum: 1000 }
    },
    required: ['sql']
  }
}
```

### 3. 权限钩子

在 handler 前面加权限层:

```ts
const dangerousCommands = /rm\s+-rf|drop\s+table/i;

handler: async (input) => {
  if (dangerousCommands.test(input.command)) {
    throw new Error('Refused: dangerous command');
  }
  return await runShell(input.command);
}
```

### 4. 流式输出

UI 中要边写边展示:

```ts
for await (const event of stream) {
  switch (event.type) {
    case 'text':       ui.appendText(event.delta); break;
    case 'tool_use':   ui.showToolCall(event.name, event.input); break;
    case 'tool_result':ui.appendToolResult(event.output); break;
    case 'thinking':   ui.appendThinking(event.delta); break;
    case 'usage':      ui.updateCost(event.usage); break;
  }
}
```

### 5. 中断

```ts
const ac = new AbortController();
process.on('SIGINT', () => ac.abort());

const stream = agent.run({ input, signal: ac.signal });
```

### 6. 接入 MCP

```ts
import { MCPClient } from '@anthropic-ai/claude-agent-sdk';

const linear = await MCPClient.connect({
  command: 'npx',
  args: ['@linear/mcp-server'],
  env: { LINEAR_API_KEY: process.env.LINEAR_API_KEY! }
});

const agent = new Agent({
  model: 'claude-sonnet-4-6',
  tools: [...localTools, ...linear.toolDefinitions()]
});
```

## 一个稍大点的实战:本地 PR 摘要 agent

需求:扫描当前仓库的 last commit / current branch,生成 PR 描述草稿。

```ts
const agent = new Agent({
  model: 'claude-sonnet-4-6',
  systemPrompt: '你是 PR 摘要助手。读 diff 后,输出 markdown 格式的 PR 描述。',
  tools: [
    { name: 'run_git', /* 限制为 git 子命令 */ },
    { name: 'read_file', /* 同前 */ }
  ]
});

const stream = agent.run({
  input: '看 git diff main...HEAD,生成 PR 描述,包含 Summary 和 Test plan'
});

let out = '';
for await (const e of stream) {
  if (e.type === 'text') out += e.delta;
}
console.log(out);
```

### 反模式

❌ 把 git 工具暴露成"任意 shell"
→ 限制 subcommand 名单(`status / log / diff / show / branch`),不要让模型有 `git push` 能力

❌ 不缓存 system prompt
→ 每次会话重新计费,成本飙升

❌ 把 prompt 写得太短
→ 模型不清楚边界,产物不可控。系统 prompt 至少几百字,定义角色/输出格式/禁忌

## 部署

| 形态 | 说明 |
| --- | --- |
| **CLI 工具** | 直接 npm 全局安装,适合个人 / 团队工程脚本 |
| **Web 服务** | 包成 HTTP/WebSocket 服务,前端通过 SSE 流式接 |
| **桌面 App** | Electron / Tauri 嵌入,本地工具能力强 |
| **Slack bot / 钉钉 bot** | 把 agent 包成 webhook 处理器 |

各形态的 prompt cache 命中策略需要单独设计 —— 一般是按 user 维度切 cache key,共享部分(system prompt)走全局 cache。

## 接下来

→ [Claude API 基础](./claude-api-basics)
