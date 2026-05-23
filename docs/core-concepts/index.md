---
title: 核心概念
description: 理解 Claude Code 的工具、命令、Skills、记忆与子代理体系
lastVerified: 2026-05 / Opus 4.7
---

# 核心概念

本部分面向**有 CLI 与 Git 经验的开发者**,聚焦 Claude Code 的底层模型。读完后你应当能解释:

- Claude Code 在每次对话中可以调用哪些工具,以及权限模式如何决定哪些工具会被自动放行
- 斜杠命令、Skills、Hooks 三者的差异 —— 谁负责什么,边界在哪里
- `CLAUDE.md` 与跨会话自动记忆系统如何协作,什么该写进哪里
- 子代理(subagent)的并行机制与上下文隔离

## 章节

1. [工具与权限](./tools-and-permissions)
2. [斜杠命令](./slash-commands)
3. [Skills 系统](./skills)
4. [CLAUDE.md 项目记忆](./claude-md)
5. [跨会话自动记忆](./auto-memory)
6. [子代理 Subagents](./subagents)
