---
title: 斜杠命令字典
description: 所有 / 命令的语法、参数、典型用法
lastVerified: 2026-05 / Claude Code 2.1.x
---

# 斜杠命令字典

斜杠命令分两类:

1. **内置命令**:harness 直接处理,不进入模型(如 `/help`、`/clear`、`/cost`)
2. **Skill 命令**:走 skill 系统,会进入模型上下文(如 `/code-review`、`/security-review`)

::: tip 命令查询
会话中输入 `/` 后按 Tab,可补全所有可用命令(包括项目本地 skill)。
:::

## 会话与状态

| 命令 | 作用 | 备注 |
| --- | --- | --- |
| `/help` | 列出所有命令与简要说明 | 入门必备 |
| `/clear` | 清空当前会话上下文 | 不影响已写入的文件 / 记忆 |
| `/compact` | 手动触发上下文压缩 | 长对话上下文逼近上限时使用 |
| `/cost` | 显示本次会话花费、token 用量、cache 命中 | 用于成本观测 |
| `/status` | 显示账户、模型、用量等综合信息 | |
| `/exit` | 退出会话 | 等价于 Ctrl+D |

## 模型与算力

| 命令 | 作用 |
| --- | --- |
| `/model` | 查看 / 切换当前模型(Opus / Sonnet / Haiku) |
| `/effort` | 查看 / 切换算力档位(low / medium / high / xhigh / max) |
| `/fast` | 切换 Fast 模式(Opus 4.6+ 支持) |

## 工程脚手架

| 命令 | 作用 |
| --- | --- |
| `/init` | 在当前仓库生成初始 `CLAUDE.md` |
| `/agents` | 管理 / 切换 agent |
| `/permissions` | 查看 / 编辑权限设置 |
| `/config` | 查看 / 修改 `settings.json` |
| `/mcp` | MCP server 管理与诊断 |

## 会话管理

| 命令 | 作用 |
| --- | --- |
| `/resume` | 从历史会话中选择恢复 |
| `/continue` | 继续最近一次会话 |
| `/fork` | 从当前会话分叉 |
| `/sessions` | 列出可用会话 |

## 记忆与文件

| 命令 | 作用 |
| --- | --- |
| `/memory` | 查看 / 编辑跨会话自动记忆(MEMORY.md) |
| `#<text>` | 把 `<text>` 写入项目 `CLAUDE.md`(快捷记忆) |
| `@<path>` | 把文件内容塞进上下文(无需读) |

## 代码审查

| 命令 | 作用 |
| --- | --- |
| `/code-review [target]` | 本地审查当前 diff 或指定目标(轻量、不联网) |
| `/review` | 等价于 `/code-review`(别名) |
| `/security-review` | 安全专项审查 |
| `claude ultrareview` | 云端多 agent 深度审查(子命令,非斜杠;支持 PR 号 / 分支) |

::: warning 区分本地与云端
`/code-review` 在本会话内执行,适合"边写边审"。`claude ultrareview` 是单独子命令,启动云端多 agent,适合 PR 提交前最终把关。
:::

## 计划与子代理

| 命令 | 作用 |
| --- | --- |
| `/plan` | 进入计划模式(只读,起草方案) |
| `/explore <query>` | 派一个 Explore agent 调研代码 |

## 反馈与帮助

| 命令 | 作用 |
| --- | --- |
| `/bug` | 上报 bug |
| `/feedback` | 一般性反馈 |
| `/release-notes` | 查看本机版本的发布说明 |

## 自定义 skill 命令

任何放在 `~/.claude/skills/<name>/SKILL.md`(用户级)或 `<repo>/.claude/skills/<name>/SKILL.md`(项目级)的 skill,**且 frontmatter 设置了 `userInvocable: true`**,都会注册为同名 `/<name>` 命令。

详见 [Skills](../core-concepts/skills) 与 [自定义 skill](../advanced/custom-skills)。

## 接下来

→ [工具能力矩阵](./tools-ref)
