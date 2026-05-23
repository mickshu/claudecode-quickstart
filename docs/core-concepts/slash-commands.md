---
title: 斜杠命令
description: 内置斜杠命令的功能与触发场景
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 斜杠命令

斜杠命令是会话内以 `/` 开头的快捷入口。它有两类来源:

- **内置命令**:harness 直接处理(如 `/clear` `/cost` `/config`)
- **Skills**:由 skill 定义,触发时把对应指令注入对话(如 `/init` `/review`)

二者在使用上没区别,都是 `/<name> [args]`。

## 内置 / 高频命令

| 命令 | 作用 |
| --- | --- |
| `/help` | 列出可用命令与帮助 |
| `/clear` | 清空当前会话上下文(不影响磁盘) |
| `/cost` | 查看本次会话累计花费 |
| `/config` | 打开配置面板(模型、主题、键位等) |
| `/model` | 切换模型(`opus` / `sonnet` / `haiku` / 完整 ID) |
| `/agents` | 进入后台 agent 视图 |
| `/mcp` | 管理 / 排查 MCP server |
| `/resume` | 选择历史会话续接 |
| `/compact` | 手动压缩当前会话上下文 |
| `/permissions` | 查看 / 修改当前权限模式 |
| `/ide` | 连接到本机 IDE |
| `/exit` | 退出会话 |

## 常用 Skill 命令

| 命令 | Skill | 作用 |
| --- | --- | --- |
| `/init` | init | 在仓库根生成 `CLAUDE.md` 模板 |
| `/review` | review | 审查 PR / diff |
| `/code-review` | code-review | 审查当前 diff(可 `--comment` 直发 PR) |
| `/security-review` | security-review | 安全审查当前分支改动 |
| `/verify` | verify | 启动应用并验证改动是否生效 |
| `/run` | run | 启动项目应用看实际效果 |
| `/loop <interval> <prompt>` | loop | 定时执行 prompt |
| `/fewer-permission-prompts` | fewer-permission-prompts | 扫描历史 → 生成 allow 列表 |
| `/update-config` | update-config | 修改 settings.json |
| `/keybindings-help` | keybindings-help | 修改 keybindings.json |
| `/claude-api` | claude-api | 构建/调试 Anthropic SDK 代码 |

各 skill 按需自动加载或显式调用。完整字典见 [斜杠命令字典](/reference/slash-commands-ref)。

## 触发流程

```
你: /review

harness:
  1. 解析 "/review" → 找到 review skill
  2. 把 skill 的 SKILL.md 注入到对话(作为系统指令)
  3. 模型按指令执行(读 diff、调用工具、给反馈)
```

::: tip skill 不是 magic
Skill 本质是"一段精心写好的 prompt + 工具配置"。当你 `/review` 时,Claude 实际收到的是 review skill 的写作指令,而非某个特殊代码路径。
:::

## 自定义命令

要新增 `/my-command`:

1. 在 `~/.claude/skills/my-command/` 下创建 `SKILL.md`(或在项目 `.claude/skills/` 内,可入仓共享)
2. 写好 frontmatter(name / description / 触发条件)
3. 重启会话或 `/agents` 重载

详见 [自定义 Skills](/advanced/custom-skills)。

## 查看哪些命令可用

```
/help
```

或直接打 `/`,会出现可用命令的下拉补全(若客户端支持)。

## 接下来

→ [Skills 系统](./skills)
