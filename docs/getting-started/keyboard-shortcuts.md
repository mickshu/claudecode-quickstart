---
title: 快捷键速查
description: REPL 中的必备键位与前缀
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 快捷键速查

按使用频率排序,从最常用到不常用。

## 输入前缀(写在输入框开头)

| 前缀 | 作用 | 示例 |
| --- | --- | --- |
| `!` | 直接执行 shell,输出送入对话 | `!git diff --stat` |
| `#` | 写入记忆(自动判断写到 `CLAUDE.md` / 用户层) | `#测试用 npm test` |
| `/` | 调用斜杠命令或 Skill | `/init` `/review` `/clear` |
| `@` | 引用文件 / 粘贴文件路径(部分客户端) | `@src/index.ts` |

## 控制键

| 按键 | 作用 |
| --- | --- |
| **Enter** | 提交当前输入 |
| **Shift+Enter** 或 **Alt+Enter** | 输入换行(写多行 prompt) |
| **Esc** | 中断当前回答 / 退出当前模式 |
| **Shift+Tab** | 循环切换权限模式(default → acceptEdits → plan → ...) |
| **Tab** | 自动补全文件路径 / 命令 |
| **Ctrl+C** | 第一次中断,第二次退出 |
| **Ctrl+D** | 退出 REPL |
| **Ctrl+L** | 清屏(不清上下文) |
| **↑ / ↓** | 历史输入翻阅 |

## 常用斜杠命令

| 命令 | 作用 |
| --- | --- |
| `/help` | 查看可用命令 |
| `/init` | 在当前项目生成 `CLAUDE.md` 模板 |
| `/clear` | 清空当前会话上下文(开始新任务前用) |
| `/config` | 打开配置面板(模型、主题、键位) |
| `/cost` | 查看本会话花费 |
| `/model` | 切换模型(opus / sonnet / haiku 或具体 ID) |
| `/agents` | 进入后台 agent 视图 |
| `/mcp` | 查看 / 排错 MCP server |
| `/review` | 审查当前 diff |
| `/resume` | 选择历史会话续接 |

完整字典见 [斜杠命令字典](/reference/slash-commands-ref)。

## 启动参数(命令行)

写在 `claude` 命令后面:

```bash
# 续接最近会话
claude --continue
claude -c

# 选会话续接
claude --resume

# 计划模式启动
claude --permission-mode plan

# 指定模型
claude --model sonnet

# 非交互式(管道场景)
echo "总结当前 diff" | claude --print

# 加可访问目录
claude --add-dir ../shared-lib

# 启动新 worktree
claude --worktree feat/auth
```

完整 flag 见 [CLI 参数](/reference/cli-flags)。

## 自定义键位

在 `~/.claude/keybindings.json` 中重绑键位、添加 chord(连续键)。

详见 [自定义键位](/advanced/keybindings)。

## 接下来

→ [一图看懂核心概念](./concepts-glance)
