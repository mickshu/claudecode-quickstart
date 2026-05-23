---
title: Bug 修复全流程
description: 从堆栈到 PR 的端到端示例
lastVerified: 2026-05 / Claude Code 2.1.148
---

# Bug 修复全流程

以一个**真实场景**演示 Claude Code 的修 bug 流。

## 场景

线上接到告警:

```
TypeError: Cannot read properties of undefined (reading 'name')
    at formatUser (src/services/user.ts:42:18)
    at /app/src/handlers/profile.ts:18:5
```

你打开终端,在仓库根目录:

```bash
cd ~/work/order-service
claude
```

## 步骤 1 — 把堆栈交给 Claude,让它先**观察**

直接贴堆栈,告诉它先别动手:

```
线上抛了这个错,先看一下源码定位问题在哪,**不要修**:

TypeError: Cannot read properties of undefined (reading 'name')
    at formatUser (src/services/user.ts:42:18)
    at /app/src/handlers/profile.ts:18:5
```

Claude 会:

1. `Read("src/services/user.ts", offset: 30, limit: 30)` 看 formatUser 实现
2. `Grep("formatUser", "src")` 看所有调用方
3. 总结猜测:某个调用方传入了未填充 `user` 字段的对象

## 步骤 2 — 进入 Plan 模式确认方案

```
进入 plan 模式,给我两种修复方案:在调用方修 vs 在 formatUser 里加防御
```

按 **Shift+Tab** 切到 plan 模式,或 prompt 里直接说。Claude 会:

- 输出方案一:调用方传完整 user 对象(根因修复)
- 输出方案二:`formatUser` 里加 `user?.name ?? 'Unknown'`(快速止血)
- 列出 tradeoff,推荐根因修复 + 加 1 个 unit test

调用 `ExitPlanMode` 等你审批。

## 步骤 3 — 实施 + 测试

批准后:

```
按方案一实施,顺便给 formatUser 加一个 'user 缺失时抛出明确错误' 的单元测试
```

Claude:

1. `Edit("src/handlers/profile.ts", old_string, new_string)` 修调用方
2. `Edit("src/services/user.ts")` 加输入校验
3. `Write("src/services/__tests__/user.test.ts")` 或 `Edit` 已有测试文件
4. `Bash("pnpm test src/services/__tests__/user.test.ts")` 跑测试

如果失败:Claude 自己看错误,调整,**不要让它进入"加 try/catch 让测试通过"的反模式**。

## 步骤 4 — 自审

```
/code-review
```

或:

```
/review
```

`code-review` skill 会扫当前 diff,以"medium effort"给出潜在 bug。修掉它指出的真问题。

## 步骤 5 — 提交

```
分两个 commit:第一个修 bug,第二个加测试。提交信息按本仓库的风格写。
```

Claude 会:

1. `Bash("git log --oneline -10")` 学风格
2. `Bash("git add src/handlers/profile.ts src/services/user.ts")`
3. `Bash("git commit -m '...'")` 用 HEREDOC 写多行 commit
4. 第二次 add + commit 测试文件
5. `Bash("git status")` 确认

## 步骤 6 — PR

```
推到 origin,创建 PR,描述里说明根因和修复方式
```

Claude 会:

1. `Bash("git push -u origin <branch>")`
2. `Bash("gh pr create --title ... --body ...")`
3. 返回 PR URL

::: warning push 是高风险动作
推送到远程是不可逆的(在他人看来)。Claude 默认会在 push / PR 创建前确认,**不要把 `Bash(git push:*)` 加到 allow 里除非你信任当前流程**。
:::

## 关键点拆解

| 步骤 | 用了什么 | 为什么 |
| --- | --- | --- |
| 步骤 1 | `Read` / `Grep` 直接调用 | 任务小,不需要 subagent |
| 步骤 2 | Plan 模式 | 修复有多个方向,先对齐再动手 |
| 步骤 3 | 普通对话 | 修改 + 跑测试,即时验证 |
| 步骤 4 | `code-review` skill | 自审,catch 自己看不到的 bug |
| 步骤 5 | `Bash(git ...)` | 学风格 + 分次提交 |
| 步骤 6 | `Bash(gh pr create)` | 团队 PR 流 |

## 常见陷阱

- **没让 Claude 先"看"就让它"改"** → 改错位置,因为它没读完整上下文
- **跳过 plan 模式直接动手** → 选了次优方案才发现该走另一条路
- **测试失败时让它"加 try/catch 让测试通过"** → 这是**作弊**,会写出 `} catch {}` 这种空捕获。要让它**找根因**
- **一个超大 commit** → 修复 + 重构 + 文档全揉一起,审阅困难。**强制分 commit**
- **不审 diff 直接 push** → 自审 5 分钟,省 PR 上来回 30 分钟

## 接下来

→ [代码审查 Code Review](./code-review)
