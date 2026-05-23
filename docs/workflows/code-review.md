---
title: 代码审查 Code Review
description: 用 /review 与 code-review skill 审查 diff
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 代码审查 Code Review

Claude Code 提供两条审查路径:**会话内自审**和**远程 ultrareview**。

## `/code-review` —— 本地自审当前 diff

最常用,提交前 5 分钟跑一次。

```
/code-review
```

或带 effort 等级:

```
/code-review --effort medium
```

| effort | 行为 | 适用 |
| --- | --- | --- |
| `low` | 只报高置信度 bug | 小改、急用 |
| `medium` | 平衡(默认) | 大多数提交前 |
| `high` | 包含中等置信度 | 重要 PR |
| `max` | 广覆盖、可能噪声 | 重大重构 |

## `--comment` —— 直接发到 PR

如果当前分支已对应 PR:

```
/code-review --comment
```

Claude 会用 `gh api` 把 finding 作为 inline comment 发到 PR 行上,而非只在终端打印。

::: warning 团队场景慎用
直接发 inline comment 是**对外可见的动作**。在团队仓库使用前确认:findings 质量足够、不会发噪音影响其他评审者。
:::

## `/review` —— 审查 PR

不限于本地 diff。指定 PR:

```
/review 1234
```

或:

```
/review https://github.com/owner/repo/pull/1234
```

Claude 会:

1. `Bash("gh pr view 1234 --json ...")` 获取 PR 元信息
2. `Bash("gh pr diff 1234")` 拿 diff
3. 按 review skill 的指令分析

## ultrareview —— 远程多 agent 审查

```bash
claude ultrareview                           # 当前分支
claude ultrareview 1234                      # PR number
claude ultrareview --base main               # 指定基线分支
```

这是**云端运行的多 agent 协同审查**,比本地 `/code-review` 更深、更慢、更贵。适合:

- 大型重构 PR
- 需要全面覆盖的发版前审
- 重要安全相关改动

输出在终端打印,可结合 `--comment` 直发 PR(具体参数见 `claude ultrareview --help`)。

## 三条路径选哪条

| 场景 | 命令 | 速度 | 深度 |
| --- | --- | --- | --- |
| 提交前自审 | `/code-review` | 秒级 | 中 |
| 看队友 PR | `/review <pr>` | 秒级 | 中 |
| 重要 PR 全面审 | `claude ultrareview` | 分钟 | 高 |
| 仅安全维度 | `/security-review` | 秒级 | 中(安全专项) |

## 与 hooks / CI 联动

把 `/code-review --comment` 包到 CI 里,每个 PR 自动审一次:

```yaml
# .github/workflows/claude-review.yml(示意)
- name: Claude review
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: claude --print "/code-review --comment"
```

详见 [CI 集成](/team/ci-integration)。

## 修正 finding 的最佳实践

Claude 给出 5 条 finding 后:

1. **按真伪标记**:哪些是真问题、哪些是误判
2. **分批修**:一类 finding 一个 commit,审阅链路清晰
3. **回写 feedback**:被误判的模式,写到 `~/.claude/projects/<project>/memory/` 的 feedback 类记忆里,下次它就不重复犯

## 常见误判

- **指出"未处理某 error 路径"**:很多时候那条路径是上层守卫过的。看上下文判断
- **建议加更多注释**:遵循"不必要的注释别加"的原则,看具体代码而非盲从
- **建议拆函数**:小函数过早抽象比"3 段相似代码"更有害

## 接下来

→ [跨文件重构](./refactor)
