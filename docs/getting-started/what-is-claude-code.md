---
title: 什么是 Claude Code
description: Claude Code 的定位、四种形态及差异
lastVerified: 2026-05 / Claude Code 2.1.148 / Opus 4.7
---

# 什么是 Claude Code

**Claude Code** 是 Anthropic 官方推出的 AI 编码助手。它让 Claude 直接接触你的代码、文件、终端,以"协作开发者"而非"问答机器"的方式工作。

## 一句话定位

> Claude Code = Claude 模型 + 你机器的工具(读写文件、跑 shell、调用 git、访问 Web、管理子代理)

它不是把代码贴进网页让 AI 解读,而是让 AI **在你的项目目录里直接执行编辑、运行、测试、提交**等动作 —— 整个过程在你的视线内,每一步都可见、可中断、可批准。

## 四种形态

| 形态 | 入口 | 适合什么场景 |
| --- | --- | --- |
| **CLI** | 终端运行 `claude` | 日常开发主力,本手册主要描述对象 |
| **桌面端 App** | macOS / Windows 客户端 | 不喜欢终端的开发者、独立 UI 体验 |
| **Web** | [claude.ai/code](https://claude.ai/code) | 临时设备、跨设备接续会话 |
| **IDE 扩展** | VS Code / JetBrains 插件 | 在编辑器内协同,光标、选区上下文更直接 |

::: tip 形态选择建议
- 如果你已经习惯终端工作流(vim、tmux、git CLI),**直接用 CLI**,功能最完整、迭代最快
- 如果你重度依赖 IDE 的跳转/调试,**装 IDE 扩展**,关键时刻让 Claude 在编辑器里直接给你打补丁
- 桌面端和 Web 是 CLI/IDE 的补充,不是替代
:::

## 与其他 AI 编码工具的关系

| 维度 | Claude Code | Cursor | GitHub Copilot |
| --- | --- | --- | --- |
| 定位 | 任务级协作 agent | AI 优先 IDE | 行内补全为主 |
| 工具调用 | 一等公民,可读写文件、跑 shell | 内置编辑器 + Composer | 需通过 Chat 间接 |
| 模型 | Claude 系列 | 多家可选 | OpenAI / Anthropic |
| 自定义 | Skills + Hooks + MCP + Agent SDK | 扩展、规则文件 | 提示文件 |

::: warning 不是替代关系
Claude Code 与 Copilot/Cursor 并不互斥:你完全可以让 Copilot 负责行内补全,在需要"完成一个真正的子任务"时切到 Claude Code。
:::

## 这本手册要解决的问题

新用户常见困惑往往不是"模型够不够强",而是:

- 工具/Skill/Hook/Memory 各管什么?
- `settings.json` 该写在用户层还是项目层?
- 什么时候该进 plan 模式,什么时候直接动手?
- 团队怎么共享配置?CI 里怎么用?
- 想把它接入自有产品,要走 SDK 还是 API?

读完本手册,这些问题都应有清晰答案。

## 接下来

→ [安装与登录](./install)

---

::: tip 信息时效
本手册依据 **Claude Code 2.1.148(2026-05)+ Opus 4.7**。功能仍在快速演进,实际命令与行为以 `claude --help` 输出和 [docs.claude.com](https://docs.claude.com/) 为准。
:::
