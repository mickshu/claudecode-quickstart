---
title: 跨会话自动记忆
description: user / feedback / project / reference 四类记忆
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 跨会话自动记忆

`CLAUDE.md` 是**项目内**的;auto-memory 是**跨会话、跨项目**的"我对这个用户/项目的长期理解"。

## 存储位置

每个项目对应一个目录,默认在:

```
~/.claude/projects/<encoded-path>/memory/
├── MEMORY.md            # 索引(每条一行,自动注入)
├── user_role.md
├── feedback_testing.md
├── project_q2_goals.md
└── reference_grafana.md
```

`MEMORY.md` 是**索引文件**,会持续注入到 system prompt 的开头。各 `*.md` 是单条记忆,按需被 Claude 主动读取。

## 四类记忆

### 1. user — 用户角色 / 偏好 / 知识

**写什么**:用户是谁、做什么角色、技术栈深浅、沟通偏好

```markdown
---
name: user-role
description: 用户的角色、所在团队、技术背景
metadata:
  type: user
---

后端工程师,主用 Go(10 年),
此前没接触过 React,本项目前端部分需要从背景类比讲起。
```

**何时用**:你介绍自己时、Claude 应据此调整解释深度。

### 2. feedback — 工作方式的纠正与确认

**写什么**:用户明确指出"不要这么做"或"这样很对继续这样"。

```markdown
---
name: feedback-tests
description: 集成测试用真实数据库,不要 mock
metadata:
  type: feedback
---

集成测试必须打真实 Postgres,不要 mock。
**Why:** 上季度 mock 测试通过但 prod migration 挂了。
**How to apply:** 在 `tests/integration/` 下生成测试时,
使用 `tests/fixtures/db.ts` 的真实连接,不要造 mock client。
```

**何时用**:用户纠正你 → 立刻写;用户少见地直接确认你的非显然选择 → 也写(避免你下次反向纠正自己)。

### 3. project — 项目动态、阶段、人员、决定

**写什么**:不能从代码 / git 推断出来的项目背景。

```markdown
---
name: project-mobile-freeze
description: 移动端发版冻结期
metadata:
  type: project
---

2026-03-05 起进入 mobile release 冻结期,非关键 PR 暂缓合并。
**Why:** 移动端要切 release branch。
**How to apply:** 该日期之后,审查 PR 时主动提示作者推迟到冻结结束。
```

**何时用**:用户说"我们 Q3 要做…"、"X 项目本周冻结"、"Y 团队负责…" 等时间敏感信息。**记得把"周四"这类相对日期换算成绝对日期**。

### 4. reference — 外部资源指针

**写什么**:在哪里能找到信息(Linear、Grafana、Slack、Confluence URL)。

```markdown
---
name: reference-oncall-dashboard
description: 后端值班看板
metadata:
  type: reference
---

grafana.internal/d/api-latency 是后端值班看板,
触发 P1 告警的延迟 SLO 在这里。
**How to apply:** 改请求路径相关代码时,提示用户去看一眼。
```

## 何时该读 / 该写记忆

### 主动读

- 用户提到过去的话题("上次我们讨论的…")
- 推荐方案前,看用户是否有相关偏好
- 用户明确说"看一下记忆"

### 主动写

- **学到任何用户长期信息**(角色、偏好、项目阶段、团队动态)
- **被纠正了** —— 必写
- **罕见的"用户主动确认你的非显然选择"** —— 也要写

### 不该写

- 项目代码结构(代码就是真理,自己看)
- git 历史 / 谁改了什么(`git log` 比记忆准)
- 一次性 bug 修复细节(commit message 里有)
- 在 `CLAUDE.md` 已经写过的内容
- 当前会话里的临时状态(用 task / plan)

## 写记忆的两步

1. **写文件**:在 `~/.claude/projects/<project>/memory/<slug>.md`,带 frontmatter
2. **更新索引**:在同目录 `MEMORY.md` 里加一行:`- [Title](file.md) — one-liner`

`MEMORY.md` 注入有 200 行硬上限,**保持简洁**,详细内容放各 `.md` 里,按需读取。

## 反模式

- **重复写**:相同事实写多次。先 Read 检查是否已有。
- **没标日期**:相对时间("下周")会过期。换算成绝对日期。
- **当作 todo list 用**:跨会话记忆≠任务清单。任务用 `TaskCreate`。
- **存敏感信息**:密钥、token、个人隐私 —— 不该进。

## 与 `CLAUDE.md` 的差别速记

| 维度 | `CLAUDE.md` | auto-memory |
| --- | --- | --- |
| 范围 | 单个项目 | 跨会话(同项目) |
| 是否入仓 | ✅ 团队共享 | ❌ 每个开发者本地 |
| 内容 | 客观项目信息 | 主观/用户特定 |
| 大小 | 越少越好 | 单条小,索引精简 |
| 更新频率 | 低(项目级) | 中(随对话) |

## 接下来

→ [子代理 Subagents](./subagents)
