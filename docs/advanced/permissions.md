---
title: 权限模型
description: allow / ask / deny 与各种 prompt 模式
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 权限模型

## 决策流程

每次 Claude 决定调用一个工具,harness 按以下顺序判断:

```
1. settings.permissions.deny 命中?      → 拒绝(报错给模型)
2. settings.permissions.allow 命中?     → 直接放行
3. settings.permissions.ask 命中?       → 弹出确认
4. 否则按当前 permission-mode 默认行为
   - default:           修改类询问,只读放行
   - acceptEdits:       Edit/Write 放行,Bash 询问
   - plan:              全部禁止修改
   - bypassPermissions: 全部放行
```

> ⚠️ `bypassPermissions`(等同启动 flag `--dangerously-skip-permissions`)是危险模式,**仅在沙盒/隔离环境**用。

## 规则的语法

### 工具级

```jsonc
{ "permissions": { "allow": ["Read", "Glob", "Grep"] } }
```

### 工具(参数 pattern)级

`Bash`、`Edit` 等支持基于参数的细粒度匹配:

```jsonc
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",       // 任何 git status ...
      "Bash(git diff:*)",
      "Bash(npm test:*)",
      "Bash(pnpm typecheck:*)",
      "Edit(src/**/*.ts)",        // 仅允许编辑 src 下的 .ts
      "WebFetch(https://docs.anthropic.com/*)"
    ]
  }
}
```

具体 matcher 语法版本间会演进,优先用 `update-config` skill,或参考[官方权限文档](https://docs.claude.com/) 与本机实际行为。

## 危险命令的兜底

无论 allow 怎么写,以下命令都应至少 ask 或 deny:

```jsonc
{
  "permissions": {
    "ask": [
      "Bash(git push:*)",
      "Bash(git reset --hard:*)",
      "Bash(rm:*)",
      "Bash(npm publish:*)",
      "Bash(yarn publish:*)"
    ],
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ~)",
      "Bash(:(){ :|:& };:)"
    ]
  }
}
```

## permission-mode 切换

| 何时 | 模式 |
| --- | --- |
| 平时 | `default` |
| 写一堆小补丁,不想每次按 y | `acceptEdits` |
| 探索/规划/不能改代码的 review | `plan` |
| 沙盒 / CI 容器,允许 Claude 自由发挥 | `bypassPermissions` |

切换方式:

- 交互式:**Shift+Tab**
- 启动 flag:`--permission-mode <mode>`
- 配置默认:`settings.permissions.defaultMode`

## fewer-permission-prompts

每天被弹 50 次"批准 git status"会让人疯。Skill `fewer-permission-prompts` 帮你扫描历史:

```
/fewer-permission-prompts
```

它会:

1. 扫近期 transcripts 中重复的只读 / 安全 Bash + MCP 调用
2. 生成一份建议加进 `.claude/settings.json` 的 `allow` 列表
3. 让你确认后写入

## 团队场景

入仓的 `.claude/settings.json` 是**团队基线**。常见做法:

```jsonc
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git branch:*)",
      "Bash(npm test:*)",
      "Bash(pnpm test:*)",
      "Bash(pnpm typecheck:*)",
      "Bash(pnpm lint:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(npm publish:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(curl:*|bash)",
      "Bash(curl:*|sh)"
    ]
  }
}
```

个人偏好(更宽或更紧)放 `settings.local.json`(不入仓)。

## CI / 非交互场景

CI 里 `--print` 模式无法弹确认。两条选择:

1. **预声明 allow 列表**:把 CI 需要的命令提前写到 `--settings <file>`
2. **`--dangerously-skip-permissions`**:仅在隔离 runner 中使用,且禁止外网访问

```bash
claude --print --settings ci/claude-settings.json "/code-review --comment"
```

## 调试权限被拒

```bash
claude --debug "permissions"
```

会输出每次决策的细节(命中哪条规则)。

## 接下来

→ [Hooks 自动化](./hooks)
