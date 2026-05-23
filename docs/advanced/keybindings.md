---
title: 自定义键位
description: ~/.claude/keybindings.json 的写法与示例
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 自定义键位

## 配置文件位置

```
~/.claude/keybindings.json
```

不存在时使用默认键位。修改后**重启 CLI 生效**。

## 用 keybindings-help skill 修改

不要手撸 JSON,用 skill:

```
/keybindings-help 把"提交输入"绑定到 Cmd+Enter
```

skill 会读、改、写,并提示重启。

## JSON 格式概览

```jsonc
{
  "bindings": [
    {
      "key": "ctrl+s",
      "action": "submit"
    },
    {
      "key": "alt+enter",
      "action": "newline"
    },
    {
      "chord": ["ctrl+x", "ctrl+c"],
      "action": "exit"
    }
  ]
}
```

具体字段名 / 可用 action 名以**实际版本**为准。`keybindings-help` skill 会把当前可用的全列出来。

## chord(连续键)

类似 Emacs 的 `C-x C-s`:

```jsonc
{
  "bindings": [
    {
      "chord": ["ctrl+g", "p"],
      "action": "permission-mode-cycle"
    }
  ]
}
```

## 常用自定义场景

### 1. 把"中断"从 Esc 改到别处

如果你 Vim 模式频用 Esc,可以重绑:

```jsonc
{ "key": "ctrl+g", "action": "interrupt" }
```

### 2. 一键跳到 Plan 模式

```jsonc
{ "key": "ctrl+p", "action": "permission-mode-plan" }
```

### 3. 清空对话

```jsonc
{ "key": "ctrl+shift+k", "action": "clear-context" }
```

## 与系统/终端键位的冲突

- macOS 的 **Cmd+W / Cmd+Q** 等系统键 Claude 无法捕获(终端层就被吃了)
- `Ctrl+C` 默认是中断,**不要重绑**(失去逃生通道很危险)
- iTerm2 / Alacritty 的快捷键可能拦截,在终端配置里查"send escape sequence"或类似选项

## 调试

```bash
claude --debug keybindings
```

会打印按下的键名、匹配到的 action、是否被拦截。

## 备份

修改前先复制原文件:

```bash
cp ~/.claude/keybindings.json ~/.claude/keybindings.json.bak
```

## 接下来

→ [MCP 服务接入](./mcp-servers)
