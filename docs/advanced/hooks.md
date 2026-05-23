---
title: Hooks 自动化
description: PreToolUse / PostToolUse / Stop / UserPromptSubmit 等事件
lastVerified: 2026-05 / Claude Code 2.1.148
---

# Hooks 自动化

> Hook = 在 harness 的事件点上,**确定性**执行一段 shell。
>
> Skill 是模型层的"智能 prompt",Hook 是系统层的"确定性脚本"。Memory / preferences 不能完成"每次 X 都做 Y"——只有 hook 能。

## 事件类型

实践中常用的事件:

| 事件 | 触发时机 | 典型用途 |
| --- | --- | --- |
| `SessionStart` | 会话启动 | 加载环境、起 sidecar、采集元信息 |
| `SessionEnd` | 会话结束 | 上报使用统计 |
| `UserPromptSubmit` | 用户提交 prompt | 注入额外上下文、敏感词预审 |
| `PreToolUse` | 工具调用前 | 阻断危险命令、改写参数、审计日志 |
| `PostToolUse` | 工具调用后 | lint / format / 自动跑测试 / 持久化 |
| `Stop` | 模型本轮回答结束 | 提醒、收集反馈 |
| `Notification` | 通知事件 | 弹通知 |

::: warning 事件名以版本为准
不同 Claude Code 版本支持的事件名 / 字段会演进。请参考官方 hooks 文档,或看 `~/.claude/settings.json` 的真实可用字段。
:::

## 配置位置

`~/.claude/settings.json` 或 `<repo>/.claude/settings.json`:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/bash-audit.js",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm prettier --write",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "say done",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

字段:

- `matcher`(可选)—— 工具/事件级别的过滤(如 `Bash`、`Edit|Write`)
- `hooks[].type` —— `"command"`(目前主流)
- `hooks[].command` —— 实际执行的 shell
- `hooks[].timeout` —— 秒
- `hooks[].async`(可选)—— 异步,不阻塞主流程

## Hook 收到什么

每次触发,harness 通过 **stdin** 给 hook 传 JSON,内含:

- 事件名
- 工具名 / 参数(若是 PreToolUse / PostToolUse)
- 用户输入(UserPromptSubmit)
- 会话 / cwd / 模型等元信息

具体字段以版本为准,**调试方法**:写一个最小 hook 把 stdin dump 到日志:

```bash
#!/usr/bin/env bash
cat > /tmp/claude-hook-$(date +%s).json
```

加到 `PreToolUse`,跑一次会话,看 `/tmp/claude-hook-*.json` 内容,再动手写真实逻辑。

## Hook 控制流程

`hook` 通过**退出码**和 **stdout 输出**影响主流程:

| 退出码 | 含义 |
| --- | --- |
| `0` | 正常通过 |
| `1` | 失败 / 阻断(具体行为依事件) |
| 其他 | 视为错误 |

部分事件还允许在 stdout 输出 JSON 来**修改后续行为**(注入额外上下文、修改参数)。具体能力随版本变化,以官方文档为准。

## 经典场景

### 1. 阻断危险命令

```bash
#!/usr/bin/env bash
# ~/.claude/hooks/dangerous-bash.sh
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // empty')

if [[ "$cmd" =~ rm[[:space:]]+-rf[[:space:]]+/ ]]; then
  echo "Blocked dangerous rm" >&2
  exit 1
fi
exit 0
```

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/dangerous-bash.sh", "timeout": 2 }]
      }
    ]
  }
}
```

### 2. 提交前自动 format

```jsonc
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "cd \"$CLAUDE_PROJECT_DIR\" && pnpm prettier --write" }
        ]
      }
    ]
  }
}
```

(具体环境变量名以版本为准。)

### 3. Session 完毕弹通知

macOS:

```jsonc
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"Claude done\" with title \"Claude Code\"'", "timeout": 5 }] }
    ]
  }
}
```

### 4. 审计日志

`PreToolUse` 上把所有 Bash 调用 append 到日志:

```bash
#!/usr/bin/env bash
input=$(cat)
echo "$(date -Iseconds) $input" >> ~/.claude/audit.log
exit 0
```

## Hook vs Skill 的边界

| 场景 | 用 Hook | 用 Skill |
| --- | --- | --- |
| 每次保存自动 format | ✅ | ❌(模型不一定每次记得) |
| 阻断 `rm -rf /` | ✅ | ❌ |
| 用户说 "审 PR" 时按规范走流程 | ❌ | ✅(`/code-review`) |
| 每次新会话提醒"今天值班" | ✅(`SessionStart`) | ❌ |

## 调试

```bash
claude --debug hooks
```

会打印每个 hook 的触发、stdin、stdout、退出码、耗时。

## 性能注意

- `timeout` 设小一点(常用 5-15s)
- 重活放 `async: true`,**不阻塞主流程**
- 同事件多个 hook 串行执行,加起来超时一切动作都被卡住

## 接下来

→ [自定义 Skills](./custom-skills)
