---
title: settings.json 字段表
description: settings.json 全部字段(用户/项目/本地三层共用)
lastVerified: 2026-05 / Claude Code 2.1.x
---

# settings.json 字段表

::: tip 三层叠加
- `~/.claude/settings.json` — 用户级
- `<repo>/.claude/settings.json` — 项目级(应入仓)
- `<repo>/.claude/settings.local.json` — 本地级(应 gitignore)

覆盖顺序:**本地 > 项目 > 用户**,详见 [settings.json 三层结构](../advanced/settings-json)。
:::

## 顶层骨架

```jsonc
{
  "$schema": "https://docs.claude.com/schemas/settings.json",
  "model": "sonnet",
  "permissions": { /* ... */ },
  "env": { /* ... */ },
  "hooks": { /* ... */ },
  "mcpServers": { /* ... */ },
  "agents": { /* ... */ },
  "skills": { /* ... */ },
  "outputStyle": "default",
  "statusLine": { /* ... */ },
  "telemetry": { /* ... */ },
  "worktree": { /* ... */ },
  "plugins": { /* ... */ },
  "experiments": { /* ... */ }
}
```

## 模型与算力

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | 别名 `opus` / `sonnet` / `haiku` 或完整 ID |
| `effort` | string | `low` / `medium` / `high` / `xhigh` / `max` |
| `fallbackModel` | string | 降级模型(默认模型过载时切换) |
| `outputStyle` | string | 输出风格,默认 `default` |

## 权限(`permissions`)

```jsonc
{
  "permissions": {
    "defaultMode": "default",
    "allow": ["Read", "Edit", "Bash(git status)", "Bash(npm run *)"],
    "ask": ["Bash(git push)"],
    "deny": ["Bash(rm -rf *)", "Bash(curl *)", "WebFetch"]
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `defaultMode` | `default` / `acceptEdits` / `auto` / `bypassPermissions` / `dontAsk` / `plan` |
| `allow` | 允许列表(精确匹配工具或参数模式) |
| `ask` | 询问列表(每次执行前确认) |
| `deny` | 拒绝列表(永远不允许) |
| `additionalDirectories` | 额外允许工具访问的目录 |

匹配语法:`<ToolName>` / `<ToolName>(arg pattern)`,详见 [权限规则与决策流程](../advanced/permissions)。

## 环境变量(`env`)

```jsonc
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "ANTHROPIC_BASE_URL": "https://your-proxy.example.com",
    "DISABLE_PROMPT_CACHING": "0"
  }
}
```

::: warning 不要把 API key 提交进仓
`ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` 等敏感字段应放 `settings.local.json` 或系统环境变量。
:::

## Hooks(`hooks`)

```jsonc
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "/path/to/check.sh" }] }
    ],
    "PostToolUse": [],
    "UserPromptSubmit": [],
    "Stop": [],
    "SessionStart": [],
    "SessionEnd": [],
    "Notification": []
  }
}
```

事件结构详见 [Hook 事件结构](./hooks-events)。

## MCP servers(`mcpServers`)

```jsonc
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "..." }
    },
    "sentry": {
      "transport": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

`command` + `args` 为 stdio,`transport: "http"` + `url` 为 HTTP / SSE。详见 [MCP servers](../advanced/mcp-servers)。

## Agents(`agents`)

```jsonc
{
  "agents": {
    "reviewer": {
      "description": "Reviews code for quality issues",
      "prompt": "你是代码审查者...",
      "model": "claude-sonnet-4-6",
      "tools": ["Read", "Grep"]
    }
  }
}
```

子字段与 [子代理](../core-concepts/subagents) 一致。

## Skills(`skills`)

```jsonc
{
  "skills": {
    "disabled": ["some-skill-name"],
    "directories": ["/extra/skill/dir"]
  }
}
```

## 状态栏(`statusLine`)

```jsonc
{
  "statusLine": {
    "type": "command",
    "command": "/path/to/statusline.sh"
  }
}
```

由命令的 stdout 渲染状态栏内容。

## Worktree(`worktree`)

```jsonc
{
  "worktree": {
    "baseRef": "fresh"
  }
}
```

`baseRef`:`fresh`(从 `origin/<default>`,默认) / `head`(从当前 HEAD)。

## Telemetry / 隐私

```jsonc
{
  "telemetry": {
    "enabled": true
  }
}
```

## Plugins(`plugins`)

```jsonc
{
  "plugins": {
    "marketplaces": ["https://example.com/marketplace.json"],
    "enabled": ["my-plugin"]
  }
}
```

## 实验(`experiments`)

```jsonc
{
  "experiments": {
    "someFlag": true
  }
}
```

未来字段以 docs.claude.com 的 schema 为准。

## 校验

```bash
# 在仓库内启动一次,无报错即配置语法正确
claude --print "echo ok"
```

也可借助 `$schema` 字段让编辑器(VS Code)给出实时校验提示。

## 接下来

→ [Hook 事件结构](./hooks-events)
