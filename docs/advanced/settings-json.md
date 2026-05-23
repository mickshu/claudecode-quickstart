---
title: settings.json 配置
description: 用户 / 项目 / 本地三层配置的优先级
lastVerified: 2026-05 / Claude Code 2.1.148
---

# settings.json 配置

## 三层配置文件

| 层级 | 路径 | 是否入仓 | 用途 |
| --- | --- | --- | --- |
| **用户** | `~/.claude/settings.json` | ❌ | 个人偏好、API key |
| **项目** | `<repo>/.claude/settings.json` | ✅ | 团队共享配置 |
| **本地** | `<repo>/.claude/settings.local.json` | ❌(`.gitignore`) | 个人对项目设置的覆盖 |

`--settings <file-or-json>` 启动时还可叠加临时配置。

## 合并优先级

启动时按 **用户 → 项目 → 本地 → CLI 临时** 顺序合并,**后者覆盖前者**。

::: tip 把规则放对层
- API key、个人键位、主题 → **用户层**
- 团队共享的权限 allow 列表、hooks、MCP server → **项目层**
- 我个人对项目设置的覆盖(本地 lint 关掉、本地额外 hook) → **本地层**
:::

## 关键字段

完整字段表见 [settings 字段表](/reference/settings-schema)。这里列最常用的:

```jsonc
{
  // 启动时设置环境变量,各种 Claude Code 行为开关
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_PROMPT_CACHING": "0"
    // ANTHROPIC_BASE_URL / ANTHROPIC_MODEL / ANTHROPIC_SMALL_FAST_MODEL 等
  },

  // 权限规则
  "permissions": {
    "defaultMode": "default",   // default / acceptEdits / plan / bypassPermissions
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(npm test:*)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "Bash(rm -rf /*)"
    ]
  },

  // hooks
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "node ~/.claude/hooks/audit.js", "timeout": 5 }
        ]
      }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "...", "timeout": 15 } ] }
    ]
  },

  // MCP server 配置
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "..." }
    }
  },

  // 默认模型
  "model": "claude-opus-4-7",

  // 主题(对应 /config 的 UI 设置)
  "theme": "dark"
}
```

## 用 update-config skill

不要手改 JSON,容易拼错或踩到字段重命名。用 skill:

```
/update-config 给 Bash(git status:*) 加到 allow,放在用户层
```

`update-config` skill 会:

1. Read 现有 settings
2. 计算合并后内容
3. Write 回去

它会理解"用户层 / 项目层 / 本地层"三种位置。

## 检查当前生效配置

```bash
claude --setting-sources user,project,local --print "/config show"
```

或在交互式 REPL 里 `/config`。

## 启动 flag 临时覆盖

```bash
# 跳过项目和本地 settings,只用用户层
claude --setting-sources user

# 单次会话用一个临时 JSON
claude --settings '{"permissions":{"defaultMode":"plan"}}'

# 加载某文件的额外配置
claude --settings ./scripts/strict.json
```

## 反模式

- **把 API key 写到项目层** —— 会一不小心入仓泄露
- **重复写在多个层** —— 维护时不知改哪个生效。原则:**写在最具体的层**(改不到团队就别动项目层)
- **直接编辑 JSON 不做语法校验** —— `jq -e . settings.json` 至少跑一下,JSON 错了 Claude 会**静默忽略**(尤其在 `--print` 非交互模式)

## `.claude/` 目录里还有什么

```
.claude/
├── settings.json
├── settings.local.json
├── CLAUDE.md          # 也可作为项目级 CLAUDE.md
├── skills/            # 项目级自定义 skills(入仓)
├── agents/            # 项目级自定义 agents
└── commands/          # 项目级自定义命令(如有)
```

## 接下来

→ [权限模型](./permissions)
