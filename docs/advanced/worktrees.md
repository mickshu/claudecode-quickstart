---
title: Worktree 隔离
description: 用 git worktree 让多任务互不污染
lastVerified: 2026-05 / Claude Code 2.1.148
---

# Worktree 隔离

`git worktree` 让你**同一个仓库同时检出多个分支到不同目录**。Claude Code 把它做成了一等公民,提供 `--worktree` flag 和 `EnterWorktree` / `ExitWorktree` 工具。

## 何时用 worktree

- **同时跑多个独立任务**:修 bug A 的同时探索 feature B,各自一个 worktree,不相互覆盖
- **大重构隔离**:实验性重构在 worktree 里跑,不污染当前工作树
- **agent 后台跑**:多个 agent 各自在独立 worktree 工作

## 启动时创建

```bash
# 创建新 worktree,自动生成名字
claude --worktree

# 指定名字
claude --worktree feat/auth

# 创建 + 启动 tmux session(需要 tmux)
claude --worktree feat/auth --tmux
```

worktree 默认放在 `.claude/worktrees/<name>/`,基于 `worktree.baseRef` 配置:

- `fresh`(默认):基于 `origin/<default-branch>`(干净起点)
- `head`:基于当前 HEAD

## 会话内创建 / 进入

主 Claude 可以用工具:

```
EnterWorktree(name: "refactor-auth")
```

或进入已有 worktree(`git worktree add` 在外面建好的):

```
EnterWorktree(path: "/path/to/existing/worktree")
```

::: warning 已有 worktree 必须已注册
`path` 必须出现在 `git worktree list` 里。Claude 不会乱进任意目录。
:::

## 退出

```
ExitWorktree(action: "keep")
```

或:

```
ExitWorktree(action: "remove")
```

| action | 行为 |
| --- | --- |
| `keep` | 保留 worktree 与分支,稍后可回来 |
| `remove` | 删除 worktree 目录与分支 |

如果有未提交改动,`remove` 会**拒绝**,需:

```
ExitWorktree(action: "remove", discard_changes: true)
```

确认要丢弃。

## 典型工作流

### 场景:同时探索两个方案

```
我现在在 main。先在 worktree-A 里实验方案 1(把鉴权迁到 JWT),
在 worktree-B 里实验方案 2(继续用 session 但加 refresh)。
两边各跑一遍测试,出报告对比。
```

Claude 会:

1. `EnterWorktree(name: "exp/jwt")`
2. 实施方案 1、跑测试、记录结果
3. `ExitWorktree(action: "keep")` 回到 main
4. `EnterWorktree(name: "exp/session-refresh")`
5. 实施方案 2、跑测试、记录结果
6. `ExitWorktree(action: "keep")` 回到 main
7. 给出对比报告

两个 worktree 都保留,你可以人工切过去看完整状态。

### 场景:agent 后台并行

```
派 3 个 agent 各自在独立 worktree 里:
- agent A:重构 src/auth/
- agent B:补 src/db/ 的测试
- agent C:整理 docs/
任务完了发通知,我去看每个 worktree 的 diff。
```

Claude:

1. 创建 3 个 worktree
2. 每个 worktree 派一个 `Agent(run_in_background: true)`
3. 主对话继续别的事
4. 每个 agent 完成时通知

## 与 tmux 联动

`--tmux` flag 把 worktree 关联到 tmux session(iTerm2 native pane 或经典 tmux):

```bash
claude --worktree feat/auth --tmux
```

退出 worktree 时:

- `keep`:tmux session 保留(终端可重新 attach)
- `remove`:tmux session 一并 kill

## 配置 worktree.baseRef

`settings.json`:

```jsonc
{
  "worktree": {
    "baseRef": "head"   // 默认是 fresh,基于 origin/main
  }
}
```

`fresh` 适合"干净试一下"(避免当前未提交改动污染);
`head` 适合"基于现在的进度继续延伸"。

## 常见陷阱

❌ **在 worktree 里改完忘记 commit/push**,然后 `remove` 丢失工作
→ 退出前 `git status` + `git log`,或先 `keep`、人工核对再删

❌ **不同 worktree 共享 node_modules / build 缓存**
→ 一些工具(pnpm 的全局 store 例外)会在 worktree 里独立装一份。提前规划磁盘空间

❌ **worktree 嵌套**:Claude 不允许,会拒绝在 worktree 里再 EnterWorktree

❌ **path 不是当前 repo 的 worktree**:Claude 拒绝,因为可能误进无关目录

## 列出当前所有 worktree

```bash
git worktree list
```

或:

```bash
ls .claude/worktrees/
```

## 接下来

进阶部分结束,继续 → [团队与企业](/team/) 或 → [生态扩展](/ecosystem/)。
