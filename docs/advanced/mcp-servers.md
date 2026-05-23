---
title: MCP 服务接入
description: 把外部数据源 / 工具暴露给 Claude
lastVerified: 2026-05 / Claude Code 2.1.148
---

# MCP 服务接入

**MCP**(Model Context Protocol)是 Anthropic 主导的开放协议,定义"AI 客户端如何与外部工具/数据源对话"。在 Claude Code 里,MCP server 接入后,**它暴露的工具会自动出现在 Claude 可调用的工具列表里**,使用方式与内置工具完全一致。

## 何时用 MCP

- 接入企业内部系统(Linear / Jira / Confluence / 自建 DB)
- 接入第三方服务(Sentry / Vercel / Stripe / GitHub Enterprise)
- 把团队定制工具(部署 / 状态查询)封装暴露给 Claude

## 安装一个 MCP server

### 命令行管理

```bash
# 列出所有已配置 server
claude mcp list

# 添加 stdio server
claude mcp add my-server -- npx my-mcp-server

# 添加 stdio server + 环境变量
claude mcp add -e API_KEY=xxx my-server -- npx my-mcp-server

# 添加 HTTP server
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 添加 HTTP server + 自定义 header
claude mcp add --transport http corridor https://app.corridor.dev/api/mcp \
  --header "Authorization: Bearer ..."

# 用 JSON 一把 add
claude mcp add-json my-server '{"command":"npx","args":["my-mcp-server"],"env":{"API_KEY":"xxx"}}'

# 从 Claude Desktop 导入(macOS / WSL)
claude mcp add-from-claude-desktop

# 查看详情
claude mcp get my-server

# 移除
claude mcp remove my-server
```

### 直接编辑配置

在 `settings.json` 中:

```jsonc
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "lin_api_..." }
    },
    "sentry": {
      "transport": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

或仓库根 `.mcp.json`(项目级,可入仓):

```jsonc
{
  "mcpServers": {
    "internal-db": {
      "command": "node",
      "args": ["./scripts/mcp-db.js"]
    }
  }
}
```

::: warning 项目级 MCP 需手动批准
为安全起见,Claude 首次进入含 `.mcp.json` 的目录,会询问是否信任并启用其中的 server。批准后会持久化。
撤回:`claude mcp reset-project-choices`。
:::

## 在会话里查看 / 调试

```
/mcp
```

会列出当前激活的 MCP server、它们暴露的工具、连接状态、最近错误。

排错:

```bash
claude --debug mcp
```

## 使用 MCP 工具

一旦接入,直接说自然语言即可:

```
查一下 Linear 上最新分给我的 5 个 issue
```

Claude 会调用 `linear` server 暴露的 `linear.search_issues` 之类工具(具体名字看 server 实现)。

## 内置/常见 MCP server

社区/官方常见(请以官方仓库为准):

- **Linear**:任务管理
- **Sentry**:错误监控
- **GitHub**(可代替部分 `gh` 用法,但 `gh` 仍是首选)
- **Filesystem**:更精细的文件操作
- **Postgres / SQLite**:数据库直连
- **Slack** / **Notion** / **Google Drive** 等内容 SaaS

具体清单见官方文档与 [Claude Code GitHub](https://github.com/anthropics/claude-code) issue / discussion 区。

## 自己写一个 MCP server

最小骨架(stdio,Node):

```js
// server.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "my-server", version: "0.1.0" });

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "echo",
    description: "Echo a message",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"]
    }
  }]
}));

server.setRequestHandler("tools/call", async (req) => {
  if (req.params.name === "echo") {
    return { content: [{ type: "text", text: req.params.arguments.message }] };
  }
});

await server.connect(new StdioServerTransport());
```

注册:

```bash
claude mcp add my-echo -- node /path/to/server.js
```

进会话:

```
echo: hello
```

详细 SDK 见 [MCP 官方文档](https://modelcontextprotocol.io/)。

## 限制 / 收紧

```bash
# 只用 --mcp-config 指定的 server,忽略其他配置
claude --strict-mcp-config --mcp-config ./minimal-mcp.json
```

适合 CI / 严格场景。

## 安全建议

- **不要把生产数据库的 admin 凭证给 MCP server**,用只读凭证或 staging 库
- **审视 server 暴露的工具能不能写**,只读优先
- **HTTP MCP server 注意 header 不要写明文密钥** —— 用 secret manager
- **企业项目优先项目级 `.mcp.json`** —— 团队可见、有 review

## 接下来

→ [Worktree 隔离](./worktrees)
