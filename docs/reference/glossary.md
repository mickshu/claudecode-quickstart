---
title: 术语表(中英对照)
description: 本手册的术语权威
lastVerified: 2026-05 / Opus 4.7
---

# 术语表(中英对照)

本表是本手册中术语的**唯一权威**。中文翻译以下列写法为准,英文原文括注以便检索。

::: tip 维护原则
- 同一术语的中文译名在全手册保持一致
- 短语首次出现时:**中文(English)**,后续仅用中文
- 难以翻译的(如 MCP)保留英文原文,在本表给出中文解释
- 新增条目按字母序插入到对应章节
:::

## A

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Agent | 代理 / Agent | 一个可自主使用工具完成任务的模型实例 |
| Agent SDK | Agent SDK | Anthropic 官方的 agent 构建库,Claude Code CLI 也基于它 |
| API key | API 密钥 | 调用 Anthropic API 的凭证 |
| `acceptEdits` | 自动接受编辑模式 | 跳过文件编辑确认,但保留危险命令拦截的权限模式 |

## B

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Bare mode | 极简模式 | `claude --bare`:跳过 hooks / LSP / 插件 / 自动记忆等 |
| Batch API | 批处理 API | 大规模异步任务接口,24h 内完成,折扣价 |
| `bypassPermissions` | 跳过权限模式 | 一切工具调用都不询问的权限模式(沙盒环境用) |

## C

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Cache breakpoint | 缓存断点 | Prompt caching 中标记可缓存边界的位置 |
| Cache creation | 缓存创建 | 首次写入 cache 的计费段(略贵于普通 input) |
| Cache read | 缓存读取 | 命中 cache 的廉价读取(约普通 input 的 1/10) |
| Citations | 引用 | API 特性,模型在回答中标注来源段落 |
| CLAUDE.md | CLAUDE.md | 项目级使用说明文件,会自动注入到对话上下文 |
| Compaction | 上下文压缩 | 长会话中自动总结历史以释放上下文 |
| Context window | 上下文窗口 | 模型一次能处理的 token 上限 |

## D

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| `default` mode | 默认模式 | 标准权限模式:危险操作询问,安全操作自动允许 |
| `dontAsk` mode | 不询问模式 | 不弹任何询问(配合 allow / deny 名单使用) |

## E

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Effort level | 算力档位 | `low` / `medium` / `high` / `xhigh` / `max`,影响推理深度 |
| Extended thinking | 扩展思考 | 让模型在回答前生成更长内部推理的能力 |
| Explore agent | Explore 子代理 | 只读搜索专用的 subagent |

## F

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Fallback model | 降级模型 | 默认模型过载时自动切换的备选模型 |
| Fast mode | 快速模式 | Opus 4.6+ 的快速输出模式,模型不变 |
| Files API | 文件 API | 一次上传文件、多次复用引用的 API |

## H

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Hook | 钩子 / Hook | 由 harness 在事件点执行的 shell 命令 |
| Harness | harness / 宿主 | 包裹模型的 CLI / SDK 进程,负责工具分发与权限 |

## M

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| MCP (Model Context Protocol) | MCP(模型上下文协议) | 暴露外部工具/数据给模型的开放协议 |
| Memory | 记忆 | 跨会话保存的用户/反馈/项目/参考信息 |
| Messages API | Messages API | Claude API 的主入口,接收 messages 数组返回回复 |

## P

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Permission mode | 权限模式 | 控制工具调用如何询问的全局模式 |
| Plan mode | 计划模式 | Claude 只读规划、不修改代码的模式 |
| Plugin | 插件 | 打包 skill / agent / hooks 等组件的分发单元 |
| Plugin marketplace | 插件市场 | 插件分发目录(可订阅多个) |
| Prompt caching | Prompt 缓存 | 复用前缀消息以降低成本与延迟 |
| Prompt injection | 提示注入 | 攻击者把恶意指令写入模型可读的内容里 |

## S

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Session | 会话 | 一次连续对话单元,有独立 ID 与持久化文件 |
| Skill | 技能 / Skill | 可被斜杠命令或自动触发的能力包 |
| Slash command | 斜杠命令 | 以 `/` 开头的会话内命令 |
| Stream JSON | 流式 JSON | `--output-format stream-json`,逐块输出事件流 |
| Subagent | 子代理 | 在主对话中派生、独立上下文的子任务执行体 |
| System prompt | 系统提示 | 模型行为的基线指令 |

## T

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Thinking budget | 思考预算 | `budget_tokens`,extended thinking 的 token 上限 |
| Tool use | 工具调用 | 模型自主决定调用工具并提交结果的机制 |
| `tool_choice` | 工具选择策略 | API 字段,控制模型必须 / 不能 / 自由调用工具 |
| Transcript | 会话记录 | session 的 jsonl 文件,可被 hook 读取 |

## U

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| `userInvocable` | 用户可调用 | skill 的 frontmatter 字段,决定是否注册为 `/<name>` |
| Ultrareview | Ultrareview | 云端多 agent 深度代码审查子命令 |

## W

| 英文 | 中文 | 简释 |
| --- | --- | --- |
| Worktree | 工作树 | Git 多目录工作机制,Claude Code 用其做任务隔离 |

## 术语统计

当前条目数:**40+**(随章节扩充持续维护)。

::: tip 提交新词
发现某术语在手册多处出现却未收录?提 PR 在本表对应字母段插入即可。
:::
