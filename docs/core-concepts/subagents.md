---
title: 子代理 Subagents
description: Explore / Plan / general-purpose / 自定义 agent
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 子代理 Subagents

> Subagent = "在主对话内,派发出去的、有独立上下文的执行单元"。

## 为什么需要 subagent

主会话的上下文(context window)是有限的。两个常见困境:

1. **海量搜索/读文件结果会污染主上下文** —— 你只想让 Claude "回答一句话",但它读了 50 个文件,主上下文被吃满
2. **多个独立子任务可以并行** —— 等串行跑完很慢,且产物各自独立,适合并行

Subagent 解决这两个问题:每个 agent 一份独立上下文,做完只**返回一段总结**给主对话。

## 内置 agent 类型

| 类型 | 用途 | 是否能写代码 |
| --- | --- | --- |
| `Explore` | **快速只读搜索** —— 找文件、grep 关键字 | ❌ |
| `Plan` | 设计实现方案,读但不改 | ❌ |
| `general-purpose` | 通用研究 / 多步骤 | ✅ |
| `claude` | 默认通用 agent(无 subagent_type 时用此) | ✅ |
| `claude-code-guide` | 回答关于 Claude Code 自身的元问题 | 取决于配置 |
| 项目自定义 agent | `--agent` 或 `.claude/agents/` 中定义 | 自定义 |

## 何时该用 / 不该用

### ✅ 该用

- **不确定文件在哪里** → `Explore`
- **任务独立、可并行** → 多个 `Agent` 并行(单条消息内并发调用)
- **大段研究后只要结论** → 让 agent 出报告,主对话只看摘要
- **改动跨多个独立模块** → 拆成几个 agent 并行写

### ❌ 不该用

- 已知文件路径,直接 `Read`
- 单一关键字查找,直接 `Grep`
- 任务<3 步,主对话直接做
- 你需要看到每一步过程(agent 默认只返回最终结果)

## 并行调用

> "如果任务彼此独立,在**同一条消息**里发出多个 Agent 调用,会并行执行"

```
[主 Claude 计划]
  并行派出:
    Agent(subagent_type: "Explore", prompt: "查找 normalizeName 的所有调用方")
    Agent(subagent_type: "Explore", prompt: "查找当前的输入校验中间件分布")
    Agent(subagent_type: "Plan", prompt: "基于以上现状给重构方案")
```

各 agent 读自己的、看自己的,主上下文只会被最终 3 段摘要污染。

::: warning 不要重复劳动
派出 agent 后,**主对话不要再做相同的事**。常见反模式:让 agent 探索代码 + 主对话也跑一遍 grep,既浪费 token 又分裂结论。
:::

## 后台执行(`run_in_background`)

部分场景需要让 agent 后台跑,主对话先继续:

```
Agent(
  subagent_type: "general-purpose",
  prompt: "...",
  run_in_background: true,
)
```

主对话继续做别的,agent 完成时会发出通知。适合**等 CI 跑完**、**远程 agent 远程提交**之类。

## 写 prompt 的关键

agent **没有主对话上下文**,prompt 必须自包含:

| 该写 | 不该写 |
| --- | --- |
| 目标 + 背景 + 已排除项 | "继续刚才的工作" |
| 文件路径 + 行号 + 具体改什么 | "你知道的那个 bug" |
| 报告字数限制("<200 词") | "随便写写" |
| 是要研究还是要改代码 | (含糊) |

具体见各 agent 类型的 description。

## Plan / Explore 的边界

- `Explore` —— 速度第一,**只读**,不写代码,不深度审视。适合 "X 在哪里"。
- `Plan` —— **设计方案**,读但不改,会输出步骤、文件清单、tradeoff。适合 "X 怎么做"。

## 自定义 agent

CLI 启动时:

```bash
# JSON 内联定义
claude --agents '{"reviewer": {"description": "Reviews code", "prompt": "You are a code reviewer"}}'

# 选用某个自定义 agent 作主 agent
claude --agent reviewer
```

或在仓库 `.claude/agents/` 下放配置文件,团队共享。

后台 agent 管理:

```bash
claude agents               # 进入后台 agent 视图
claude agents --json        # 当前活跃 session JSON 输出
```

## 接下来

核心概念结束。可以转向 → [实战工作流](/workflows/) 看真实案例,或继续 → [进阶定制](/advanced/) 深入配置。
