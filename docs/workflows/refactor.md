---
title: 跨文件重构
description: Plan 模式 + Explore agent 的协同
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 跨文件重构

跨文件重构是 Claude Code 最能体现价值的场景 —— 但也是最容易"做错"的。

## 总流程

```
进 Plan 模式 → 派 Explore 摸现状 → 设计方案 → 退出 Plan → 分批改 → 验证
```

## 场景

> 把 `src/legacy/auth.ts` 中所有遗留的 `validateToken(token: string)` 调用方迁移到新的 `auth/v2.ts` 中的 `verifyToken(req: Request)`,共涉及 14 个文件。

## 步骤 1 — 先进 Plan 模式

```bash
claude --permission-mode plan
```

或在会话内 `Shift+Tab` 切到 plan。

```
请帮我重构:把 validateToken(token) 的所有调用迁移到 verifyToken(req)。
新签名取自 req,接口在 src/auth/v2.ts。
14 个调用点。先派 agent 摸现状,然后给方案。
```

## 步骤 2 — Explore agent 并行摸现状

主 Claude 会**并行派出**:

```
Agent(Explore, "找出 validateToken 的所有调用点,列文件:行号 + 上下文")
Agent(Explore, "看 src/auth/v2.ts 中 verifyToken 的完整签名和实现")
Agent(Explore, "找现有调用方中 token 提取的来源:是否都来自同一个 req 字段")
```

3 个 agent 并行执行,各自只读,各自返回结论。主对话上下文几乎不被污染。

## 步骤 3 — Plan 写出 14 个文件的具体改动

主 Claude 综合 3 份报告,生成一份 plan:

```markdown
## Context
- v2 接口需要从 req.headers.authorization 拿 token,然后调用 ...
- 14 处调用,全部能拿到 req

## Pattern
对每个调用方:
1. 把入参从 (req.headers.authorization) 改成 (req)
2. 把方法名 validateToken 改 verifyToken
3. 把 import 从 legacy/auth 改成 auth/v2

## Files
1. src/handlers/profile.ts:18
2. src/handlers/orders.ts:42
... (14 个)

## Special cases
- src/handlers/admin.ts 拿的是 req.cookies.token,需要单独适配
- src/__tests__/auth.test.ts 的 mock 要改

## Verification
- pnpm typecheck
- pnpm test
- 启动应用做一次登录
```

调用 `ExitPlanMode` 等你审批。

## 步骤 4 — 分批实施

> 一次改 14 个文件 + 一个超大 commit = 灾难

让 Claude 分组提交:

```
按"普通调用方"和"特殊适配"两组改,每组一个 commit。
普通组先改完跑测试,通过再改特殊组。
```

Claude:

1. 改前 12 个普通调用方
2. `Bash("pnpm typecheck")`
3. `Bash("pnpm test")`
4. 通过后,`git add` + `commit`
5. 改 admin.ts(特殊 cookies 来源)+ 改测试 mock
6. 再次 typecheck + test
7. `git add` + `commit`

## 步骤 5 — 实地验证

类型检查和测试通过≠功能正常。**用 verify skill**:

```
/verify
```

让 Claude 启动应用、模拟一次真实登录、确认行为没变。

或:

```
/run
```

## 关键点

| 关键点 | 为什么 |
| --- | --- |
| **必走 Plan 模式** | 14 个文件的改动顺序错一个就是连锁错 |
| **Explore agent 并行摸现状** | 节约主上下文 + 速度 |
| **分批 commit** | 出问题能 `git reset` 单组 |
| **typecheck + test + verify** | 三层验证,缺一不可 |
| **特殊 case 单独一批** | 不要让特殊适配把通用模板复杂化 |

## 反模式清单

❌ **不进 plan 直接说"重构吧"**
→ Claude 会从某个文件开始,改 1 个,跑测试,发现失败,改回来,再换思路 —— 浪费且产物零碎

❌ **让 14 个文件一个 commit**
→ 审阅、回滚、bisect 都难

❌ **跳过 typecheck**
→ TypeScript 改到一半通常一片红,跑了 typecheck 才知道还差什么

❌ **不实地启动应用**
→ 编译过、测试过都不等于活的;`verify` / `run` skill 这一步省不了

❌ **派一个 Explore 同时让主对话也 grep 一遍**
→ 重复劳动,浪费 token

## Worktree 隔离(可选)

跨大重构推荐在 git worktree 里做:

```bash
claude --worktree refactor/auth-v2
```

或会话内:

```
EnterWorktree(name: "refactor-auth-v2")
```

改完合并到主分支,不会污染当前工作树。详见 [Worktree 隔离](/advanced/worktrees)。

## 接下来

→ [生成测试](./test-generation)
