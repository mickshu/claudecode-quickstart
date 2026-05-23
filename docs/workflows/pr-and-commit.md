---
title: 提交与 PR
description: 提交规范、HEREDOC commit、PR 模板
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 提交与 PR

## 让 Claude 学风格再写

不要直接说"写个 commit"。先让它学风格:

```
看一下最近 10 条 commit 的风格,然后给当前 staged 改动写 commit 信息
```

Claude:

1. `Bash("git log --oneline -10")`
2. `Bash("git diff --staged")`
3. 综合输出风格匹配的信息

## HEREDOC 写多行 commit

shell 双引号转义多行 commit 信息容易出 bug。Claude 默认用 HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
fix(auth): handle missing user.name in formatUser

Prior callers passed pre-validated user objects, but the new
profile handler passes raw rows from DB which may have
undefined name. Add explicit input validation and a unit test.
EOF
)"
```

::: tip 不要 amend 已 push 的 commit
默认创建**新 commit**,不要 `--amend`。amend 会改写 SHA,远程已有时会冲突 / 强推 / 影响他人。
:::

## 分批提交

大改动**强制分批**:

```
分两个 commit:
1) 修 bug 本身(src/services/user.ts + src/handlers/profile.ts)
2) 加测试(src/services/__tests__/user.test.ts)
两次都跑 typecheck 通过再提交
```

每次 `git add <具体文件>`,**避免 `git add .` / `-A`** —— 否则会误带 `.env` 或 build 产物。

## hook fail 的处理

pre-commit hook 失败时:

> commit **没**发生 —— 这时千万别 `--amend`,因为 amend 改的是**上一个**已存在的 commit。

正确流程:

1. 看 hook 报错
2. 修复(format / lint / 类型)
3. 重新 `git add`
4. 再次 `git commit`(创建新 commit)

`--no-verify` 跳过 hook **只能在用户明确授权**时用 —— 默认不要。

## PR 创建

GitHub 用 `gh` CLI:

```bash
gh pr create --title "fix(auth): handle missing user.name" --body "$(cat <<'EOF'
## Summary
- 调用方 profile handler 现在传整个 req 而非预校验对象
- formatUser 加输入校验,缺字段时抛 AppError
- 加单元测试覆盖 3 个边界

## Test plan
- [x] pnpm test
- [x] pnpm typecheck
- [ ] reviewer 验证 staging 上的 /api/profile

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

PR 标题保持 < 70 字符,详情进 body。

## 与团队 PR 模板的接入

如果仓库有 `.github/pull_request_template.md`:

```
按 .github/pull_request_template.md 的格式生成 body
```

Claude 会读模板、按字段填空。

## 远程已设的 commit 风格

如果用 [Conventional Commits](https://www.conventionalcommits.org/) 等强制格式,把规则写到 `CLAUDE.md`:

```markdown
## Commit style
使用 Conventional Commits:
- type: feat / fix / chore / refactor / docs / test
- scope: 模块名(auth, db, api, ...)
- 格式:`<type>(<scope>): <subject>`,subject 用祈使句、小写、≤ 50 字
```

之后 Claude 自动遵循。

## 自动签署 / Co-Author

Claude 默认在它生成的 commit 末尾加:

```
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

(版本不同邮箱可能略有差异)

如果团队不希望 AI 署名,在 `CLAUDE.md` 写:

```markdown
## Commits
- 不要在 commit 信息中加 "Co-Authored-By: Claude ..." 行
```

## 推送前的最后检查

```
push 前最后确认一遍:
- git status 是否干净(没有忘加的文件)
- git log 看新 commit 是否符合预期
- 没有 .env / 大 binary / 临时文件
```

让 Claude 跑 `git status` + `git log` 给摘要,确认后:

```
推到 origin
```

## 不要做

- ❌ `git push --force` 到 main / master(永远不要)
- ❌ `git push --force` 到他人共享的分支(沟通后再说)
- ❌ `git reset --hard` 抢救冲突(先 stash 或新分支)
- ❌ 用 `git add -A` 一把梭(可能加进 secrets)
- ❌ `--no-verify` 跳过 hook(除非用户明确授权)

## 接下来

工作流部分结束。可继续 → [进阶定制](/advanced/) 或 → [团队与企业](/team/)。
