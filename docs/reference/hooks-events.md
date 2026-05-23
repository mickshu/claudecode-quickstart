---
title: Hook 事件结构
description: 各类 hook 事件的触发时机、stdin payload、退出码语义
lastVerified: 2026-05 / Claude Code 2.1.x
---

# Hook 事件结构

::: tip 一图看懂
hook 是**进程**,通过 **stdin 传 JSON** 接收事件,通过**退出码**或**stdout JSON** 影响行为。详见 [Hooks 自动化](../advanced/hooks)。
:::

## 通用模型

```
事件 → harness 序列化 JSON → 写入 hook 进程 stdin
                                      ↓
                            hook 退出码 / stdout JSON
                                      ↓
                            harness 决定:继续 / 阻断 / 改写
```

退出码:

| 退出码 | 语义 |
| --- | --- |
| `0` | 正常,允许继续 |
| `2` | 阻断本次操作(`stderr` 内容会回显给模型作为反馈) |
| 其他非 0 | 一般性错误,日志记录但不阻断 |

通用 stdout 结构(可选):

```json
{
  "decision": "approve" | "block",
  "reason": "可读说明,会传给模型",
  "modifiedInput": { /* 仅 PreToolUse 可改写工具入参 */ }
}
```

## 事件清单

| 事件 | 触发时机 | matcher | 阻断行为 |
| --- | --- | --- | --- |
| `SessionStart` | 会话开始时 | 无 | 不可阻断,可注入 system 段 |
| `SessionEnd` | 会话退出时 | 无 | 不可阻断 |
| `UserPromptSubmit` | 用户提交一条消息后、模型读取前 | 无 | 可阻断该 prompt |
| `PreToolUse` | 工具调用前 | 工具名 | 可阻断或改写 |
| `PostToolUse` | 工具调用后 | 工具名 | 不阻断,只观察 |
| `Stop` | 模型回合结束时 | 无 | 可"再唤一次"模型 |
| `Notification` | 系统通知触发时(如等待用户输入) | 无 | 不阻断 |

## 各事件 payload 字段

::: warning 字段以实现为准
下表为常见字段。具体版本 payload 可能新增字段,**写 hook 时务必先 `cat > /tmp/dump.json`** 看一眼真实结构。
:::

### SessionStart / SessionEnd

```json
{
  "session_id": "uuid",
  "cwd": "/Users/.../project",
  "model": "claude-sonnet-4-6",
  "transcript_path": "/Users/.../sessions/<id>.jsonl"
}
```

### UserPromptSubmit

```json
{
  "session_id": "uuid",
  "user_message": {
    "role": "user",
    "content": "..."
  },
  "cwd": "/path"
}
```

阻断:返回 `decision: "block"` 或 exit 2,Claude 不会处理此条 prompt。

### PreToolUse

```json
{
  "session_id": "uuid",
  "tool_name": "Bash",
  "tool_input": {
    "command": "git push",
    "description": "Push to remote"
  },
  "cwd": "/path"
}
```

可改写:

```json
{ "decision": "approve", "modifiedInput": { "command": "git push --dry-run" } }
```

### PostToolUse

```json
{
  "session_id": "uuid",
  "tool_name": "Edit",
  "tool_input": { /* ... */ },
  "tool_output": { /* 工具返回 */ },
  "cwd": "/path"
}
```

适合做"格式化"或"自动 lint":Edit 之后跑 prettier。

### Stop

```json
{
  "session_id": "uuid",
  "transcript_path": "...",
  "stop_reason": "end_turn"
}
```

可触发"自我审查":hook 解析 transcript,如果发现遗漏要求,通过 stdout 让模型再跑一轮。

### Notification

```json
{
  "session_id": "uuid",
  "kind": "permission" | "idle" | "...",
  "message": "..."
}
```

## 配置位置

```jsonc
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/abs/path/check-bash.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "/abs/path/format.sh" }
        ]
      }
    ]
  }
}
```

`matcher` 支持工具名精确匹配或简单的 `|` 分隔正则。

## 调试

把 stdin 倒到日志再继续:

```bash
#!/usr/bin/env bash
tee -a /tmp/claude-hook-$(basename "$0").log
```

设为 `PreToolUse` 即可观察真实 payload。

## 安全注意

- hook 拥有**用户级 shell 权限**,不要从不可信源加载
- 阻断恶意 Bash 模式可在 `PreToolUse` 加正则:

```bash
if echo "$payload" | jq -r .tool_input.command | grep -qE 'rm\s+-rf|drop\s+table'; then
  echo "danger" >&2
  exit 2
fi
```

详见 [安全与合规](../team/security-compliance)。

## 接下来

→ [术语表(中英对照)](./glossary)
