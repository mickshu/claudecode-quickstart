---
title: Agent SDK 简介
description: Claude Agent SDK 与 Claude Code 的关系
lastVerified: 2026-05
---

# Agent SDK 简介

## 一句话

> **Claude Agent SDK** 是 Anthropic 官方的 agent 构建库;**Claude Code CLI 是它的一个客户端实现**。

如果 Claude Code 的能力你只是想"用",**用 CLI 就够**。
如果你要把 Claude 的"agent + 工具"能力嵌入**自有产品 / 自定义 UI / 特殊工作流**,用 SDK。

## 它解决什么

裸 Claude API 给你的是:模型 + tool_use 协议。但要把它做成 Claude Code 那种 "持续会话 + 工具调用 + skill 管理 + memory + plan 模式 + worktree" 的体验,你得:

- 写 tool 执行循环
- 处理工具结果回传、错误重试
- 实现 prompt caching 命中
- 实现 token 计算 / 成本控制
- 处理流式输出 / 中断
- 管理 skill 加载、hooks、权限模型

Agent SDK 把这些**预制好**,你只填:"我有什么工具、我希望 agent 怎么思考、UI 怎么展示"。

## 与 Claude API 的关系

```
你的产品
  ↓ 用
Claude Agent SDK   ← 提供 agent 抽象、工具 loop、skill / memory 框架
  ↓ 用
@anthropic-ai/sdk  ← 包装 HTTP API
  ↓ HTTP
api.anthropic.com  ← Claude 模型
```

直接用底层 SDK 也可以,但你得自己写 agent loop —— 一般情况下不值得。

## 适用场景

✅ 适合:

- 在你的 web app / 桌面 app / IDE 扩展里嵌入"AI 助手"
- 给非技术用户做一个"对话式工具"(比如商业分析、内容编辑)
- 给团队做内部 agent(自动化运维、客服、报表)
- 已有产品需要"AI 模式",不想直接暴露 Claude Code CLI

❌ 不适合:

- 你只是个开发者,想用 AI 写代码 → 直接用 Claude Code CLI
- 你只是想做一次性脚本调用 Claude → 用底层 `@anthropic-ai/sdk` 即可
- 你想做的事 Claude Code CLI 已能做(**先评估**,别重复造轮子)

## 语言支持

- **TypeScript / JavaScript** —— `@anthropic-ai/claude-agent-sdk`(主要)
- **Python** —— Anthropic 也维护 Python SDK,功能跟进中

::: warning 版本演进
Agent SDK 的 API 与 Claude Code CLI 同步演进,版本兼容窗口可能较窄。生产前锁住版本号,跟踪 release notes。
:::

## 核心概念速览

| 概念 | SDK 中的体现 |
| --- | --- |
| 工具 | 你声明的 tool definitions(name + schema + handler) |
| 会话 | `Session` / `Conversation` 对象,保存历史 |
| Skill | 注入到 system prompt 的指令 |
| Memory | 持久化历史 / context |
| Hook | 事件 callback |
| Plan 模式 | 工具集临时收紧为只读 |
| Permissions | tool 调用的 allow / ask / deny |
| MCP | 通过 SDK 接入,与 Claude Code 一致 |

## 接下来

→ [Agent SDK 构建实战](./agent-sdk-build)
