---
title: Skills 系统
description: 用户可调用与自动触发的 skill
lastVerified: 2026-05 / Claude Code 2.1.148
---

# Skills 系统

## 一句话

> Skill 是"一段被命名的指令包",可由用户 `/skill-name` 显式触发,或由 harness 在条件满足时自动注入到对话。

它解决的问题:**让"我每次都得告诉 Claude 怎么做 PR review / 怎么写 commit / 怎么跑测试"**变成**"`/review` 一下就行"**。

## 两类触发方式

### 1. 用户可调用(User-invocable)

明面上的 `/` 命令。例如:

```
/review
/init
/loop 10m /run-tests
```

用户敲哪个,harness 加载哪个 skill 的指令。

### 2. 自动触发(Auto-trigger)

部分 skill 注册了"匹配条件",当条件满足时 harness 自动加载。例如:

- 编辑包含 `import anthropic` 的文件 → `claude-api` skill 自动激活
- 用户提到 "MCP 排错" → `mcp` 相关 skill 提示

::: tip 自动触发≠模型决策
自动触发由 harness 的关键词/路径匹配决定,**确定性**。它不是"模型自己选 skill"。
:::

## Skill 的内部结构

每个 skill 是一个目录(默认在 `~/.claude/skills/<skill-name>/` 或 `<repo>/.claude/skills/<skill-name>/`):

```
my-skill/
├── SKILL.md          # 主指令文件,带 frontmatter
├── helpers/          # (可选)子文档,被 SKILL.md 引用
└── examples/         # (可选)示例
```

`SKILL.md` 顶部 frontmatter 大致:

```markdown
---
name: my-skill
description: 一句话描述,告诉用户/模型何时该用
trigger:
  patterns:
    - "import anthropic"
  files:
    - "*.py"
---

# my-skill

(具体指令内容,会作为系统提示注入)
```

::: warning 字段细节会变
不同版本 Claude Code 的 SKILL.md 字段结构会演进。用 `claude --help` 或官方 skills 范例为准,或参考 `~/.claude/skills/` 下的现有 skill 结构。
:::

## Skill vs Slash Command vs Hook

| 维度 | Slash command | Skill | Hook |
| --- | --- | --- | --- |
| **谁执行** | harness 直接处理 | 模型按 skill 指令执行 | 本地 shell 脚本 |
| **用途** | UI 操作、状态切换 | 复杂任务的"模板化指令" | 确定性自动化、安全网 |
| **可中断** | 即时返回 | 模型可以中断 | 阻塞 / 修改流程 |
| **要不要写 prompt** | 不要 | **核心是 prompt** | **核心是脚本** |

简单记忆:

- **要让 Claude 用一致的方式做某类任务** → 写 Skill
- **要在某个事件确定性地做某事** → 写 Hook
- **要做 UI 切换 / 状态查询** → 用内置 Slash Command

## 内置 Skill 总览

| Skill | 何时用 |
| --- | --- |
| `init` | 新仓库初次进入,生成 `CLAUDE.md` 模板 |
| `review` | 审查 PR / diff |
| `code-review` | 审查当前 diff,可发评论 |
| `security-review` | 安全维度的审查 |
| `verify` | 改完代码,跑应用确认有效果 |
| `run` | 直接启动项目应用看效果 |
| `loop` | 定时跑某个 prompt |
| `fewer-permission-prompts` | 扫描历史,生成 allow 列表 |
| `update-config` | 修改 settings.json |
| `keybindings-help` | 修改 keybindings.json |
| `claude-api` | 写/调 Anthropic SDK 代码时自动加载 |
| `claude-code-guide` | 关于 Claude Code 的元问答 |

## 写一个最小 skill

创建 `~/.claude/skills/say-hi/SKILL.md`:

```markdown
---
name: say-hi
description: 用礼貌的中文打招呼
---

# say-hi

当被触发时,用一句简洁的中文向用户问好,
并询问今天打算做什么。不要调用任何工具。
```

重启 CLI 后:

```
/say-hi
```

应当看到 Claude 的问候语。

详见 [自定义 Skills](/advanced/custom-skills)。

## 接下来

→ [CLAUDE.md 项目记忆](./claude-md)
