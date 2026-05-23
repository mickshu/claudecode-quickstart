---
title: 团队共享配置
description: 哪些 .claude/ 文件该入仓
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 团队共享配置

入仓共享配置 = 让团队所有人**用一致的 Claude 行为**,而不依赖每个人个人配置。

## 该入仓的(团队基线)

| 文件 / 目录 | 用途 | 说明 |
| --- | --- | --- |
| `CLAUDE.md`(根) | 项目使用说明 | 必入 |
| `.claude/CLAUDE.md` | 项目使用说明(备选位置) | 二选一 |
| `.claude/settings.json` | 团队权限基线、hooks、MCP | 入 |
| `.claude/skills/` | 团队定制 skill | 入 |
| `.claude/agents/` | 团队定制 agent 配置 | 入 |
| `.claude/commands/` | 团队定制命令(若用) | 入 |
| `.mcp.json` | 项目级 MCP 配置 | 入 |

## 不该入仓的(本地 / 个人)

| 文件 | 为什么 |
| --- | --- |
| `.claude/settings.local.json` | 个人覆盖,不应共享 |
| `~/.claude/*` | 用户级,不在仓库 scope |
| 任何含 `ANTHROPIC_API_KEY` 的文件 | 凭证不能入仓 |
| `.claude/worktrees/` | 临时工作树 |
| `.claude/cache/` / `.claude/sessions/` | harness 自己的运行时数据 |

## 推荐 `.gitignore`

仓库根:

```gitignore
# Claude Code 本地状态
.claude/settings.local.json
.claude/worktrees/
.claude/cache/
.claude/sessions/

# 不要入仓的常见敏感物
.env
.env.local
*.pem
```

## 推荐项目层 settings.json 模板

```jsonc
{
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git branch:*)",
      "Bash(git show:*)",
      "Bash(pnpm test:*)",
      "Bash(pnpm typecheck:*)",
      "Bash(pnpm lint:*)",
      "Bash(pnpm build:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(git reset:*)",
      "Bash(git rebase:*)",
      "Bash(rm:*)",
      "Bash(npm publish:*)",
      "Bash(pnpm publish:*)"
    ],
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(curl:*|bash)",
      "Bash(curl:*|sh)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "pnpm prettier --write --ignore-unknown" }
        ]
      }
    ]
  }
}
```

## 怎么把这些落地到团队

### 1. 由"谁"维护

- **`.claude/settings.json` / hooks / skills**:由平台/工具组的 1-2 人维护,改动走 PR
- **`CLAUDE.md`**:谁都可以改,但需要 review;**保持精简**
- **`.mcp.json`**:涉及凭证管理,通常由 DevOps / 平台组管

### 2. Onboarding 文档加一段

新人入职时,在仓库 `CONTRIBUTING.md` 加:

```markdown
## 使用 Claude Code

仓库已包含 .claude/ 团队配置(权限、hooks、skills)。
首次使用步骤:

1. 安装 Claude Code:`npm i -g @anthropic-ai/claude-code`
2. 登录:`claude` 走 OAuth 或设 `ANTHROPIC_API_KEY`
3. 进入仓库:`cd <repo> && claude`
4. 首次会话会询问是否信任本仓库的 .mcp.json,选"是"

个人偏好(如更宽松的 allow 列表)请放 `.claude/settings.local.json`,**不要**改 `.claude/settings.json`。
```

### 3. 用 PR 管控团队配置

`.claude/settings.json` 改动**必须走 PR review**。原因:

- allow 列表加错 → 危险命令静默通过
- hook 加错 → 每个 commit 卡 30s
- skill 加错 → 团队全员被错误 prompt 误导

### 4. 给个人留逃生通道

某天团队 hook 太吵,个人想关:

```jsonc
// .claude/settings.local.json
{
  "hooks": {
    "PostToolUse": []   // 覆盖项目层
  }
}
```

文档里告诉团队这是"应急通道",但平时不要用,有问题就提 PR 改基线。

## 个人偏好与团队规范冲突的解法

冲突类型:

- **团队太严,个人想宽**:个人 `.local.json` 加 allow,但是别提 PR
- **团队太宽,个人想严**:个人 `.local.json` 加 ask / deny
- **团队 hook 个人不想要**:`.local.json` 覆盖为空数组
- **团队风格(如要 conventional commits),个人不喜欢**:不行,这是团队规范,改要走团队讨论

## 接下来

→ [CI 集成](./ci-integration)
