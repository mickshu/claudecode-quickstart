---
title: CI 集成
description: 在 GitHub Actions / GitLab CI 中非交互式调用 Claude Code
lastVerified: 2026-05 / Claude Code 2.1.148
---

# CI 集成

CI 里跑 Claude Code 关键是**非交互**:

- 用 `--print` / `-p` 让它打印结果就退出
- 用 `--settings` 提前声明权限,避免 prompt
- 用 `ANTHROPIC_API_KEY` 通过 secret 注入

## 最小 GitHub Actions 示例

`.github/workflows/claude-review.yml`:

```yaml
name: Claude Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # 完整 git 历史,review 用

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run code review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          claude --print \
            --settings .github/claude-ci-settings.json \
            "/code-review --comment"
```

`.github/claude-ci-settings.json`(CI 专用,放仓库内):

```jsonc
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push:*)",
      "Bash(npm publish:*)"
    ]
  }
}
```

::: warning bypassPermissions 在 CI
CI runner 是隔离环境,但仍要 `deny` 真正不可恢复的动作。**永远不要**让 `git push` 在 review job 里能跑 —— review 不应改远程状态。
:::

## GitLab CI 示例

`.gitlab-ci.yml`:

```yaml
claude-review:
  image: node:22
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY   # 在 GitLab 项目 CI/CD 设置中加
  script:
    - npm install -g @anthropic-ai/claude-code
    - claude --print --settings .gitlab/claude-ci-settings.json "/code-review"
```

## 几种典型 CI 用法

### 1. PR 自动审

参见上面例子。

### 2. PR 自动加 changelog

```yaml
- name: Update changelog
  run: |
    claude --print \
      "读 git diff,看是否需要更新 CHANGELOG.md。如果需要,直接编辑 CHANGELOG.md 并 git add."
- run: |
    if ! git diff --staged --quiet; then
      git config user.email "claude-bot@example.com"
      git config user.name "Claude Bot"
      git commit -m "chore: update changelog"
      git push
    fi
```

(这种"AI 自动 commit"流要慎用,见反模式)

### 3. Issue triage

定时跑:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'   # 工作日 9 点

jobs:
  triage:
    steps:
      - run: |
          claude --print --settings ci.json \
            "用 gh issue list 看新 issue,按 bug / feature / question 打标签"
```

### 4. 安全扫描

```yaml
- run: |
    claude --print "/security-review"
```

## 输出处理

`--output-format json`:

```bash
claude --print --output-format json "/code-review"
```

输出形如:

```json
{
  "result": "...findings...",
  "model": "claude-opus-4-7",
  "usage": { "input_tokens": 1234, "output_tokens": 567 }
}
```

便于下游脚本解析。

`stream-json` 适合流式处理:

```bash
claude --print --output-format stream-json --include-partial-messages
```

## 成本控制

CI 容易跑飞,一定加上:

```bash
claude --print --max-budget-usd 0.50 "..."
```

超过预算会自动中止。

也可指定更便宜的模型:

```bash
claude --print --model haiku "..."
```

或用 fallback:

```bash
claude --print --model opus --fallback-model sonnet "..."
```

## 反模式

❌ **CI 里跑修改类任务并自动 commit/push**
→ 容易循环触发 CI、误改、难审。要让 CI 仅产出 finding,人工合并

❌ **不设 budget 直接跑**
→ 一次错误的死循环 prompt 能烧光月度预算

❌ **把 `ANTHROPIC_API_KEY` 用 echo 打到日志**
→ 用 `secrets` 注入,GitHub / GitLab 会自动 mask;但你自己别 echo

❌ **CI 里用 `--dangerously-skip-permissions` 又能访问公网**
→ 模型可能在错误指引下做出不可预期 HTTP 请求。要么收紧 deny,要么禁外网

## 进阶:管道用 stdin

```bash
git diff main...HEAD | claude --print --input-format text "总结这次 diff 的核心改动,3 句话"
```

或用 stream-json 实时输入输出。

## 接下来

→ [安全与合规](./security-compliance)
