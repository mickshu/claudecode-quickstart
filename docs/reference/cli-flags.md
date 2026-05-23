---
title: CLI 参数
description: claude 命令行所有 flag 与子命令(以 claude --help 为准)
lastVerified: 2026-05 / Claude Code 2.1.x
---

# CLI 参数

::: tip 权威来源
本表整理自 `claude --help`、`claude <subcommand> --help` 的实际输出。线上版本如有变化以本机 `claude --help` 为准。
:::

## 调用形式

```
claude [options] [command] [prompt]
```

- 不带任何参数 → 启动交互式 REPL
- 带 `prompt` → 进入交互式会话并执行该 prompt
- 带 `-p / --print` → 单次执行后退出(适合管道、脚本、CI)

## 启动 / 输入

| Flag | 说明 |
| --- | --- |
| `-c, --continue` | 继续当前目录最近一次会话 |
| `-r, --resume [value]` | 按 session ID 恢复;不传值则打开交互式选择器 |
| `--fork-session` | 与 `--resume` / `--continue` 配合,生成新 session ID |
| `--from-pr [value]` | 恢复一个绑定到 PR 的会话(传 PR 号 / URL) |
| `--session-id <uuid>` | 指定 session UUID |
| `--no-session-persistence` | 禁用会话持久化(仅 `--print` 下生效) |
| `-n, --name <name>` | 设置会话显示名 |
| `--file <specs...>` | 启动时下载远端文件,格式 `file_id:relative_path` |
| `--add-dir <directories...>` | 允许工具访问额外的目录 |

## 模型与算力

| Flag | 说明 |
| --- | --- |
| `--model <model>` | 模型别名(`sonnet` / `opus` / `haiku`)或完整 ID(`claude-opus-4-7`) |
| `--fallback-model <model>` | 默认模型过载时自动降级(仅 `--print` 下生效) |
| `--effort <level>` | 算力档位:`low` / `medium` / `high` / `xhigh` / `max` |
| `--max-budget-usd <amount>` | 单次会话最大花费(仅 `--print` 下生效) |

## 系统 prompt 与上下文

| Flag | 说明 |
| --- | --- |
| `--system-prompt <prompt>` | 覆盖默认系统 prompt |
| `--append-system-prompt <prompt>` | 在默认系统 prompt 后追加 |
| `--exclude-dynamic-system-prompt-sections` | 把每机相关段(cwd、env、git status)移出 system prompt,提升跨用户 cache 命中率 |
| `--bare` | 极简模式:跳过 hooks / LSP / 插件同步 / 自动记忆 / `CLAUDE.md` 自动发现等 |

## 工具与权限

| Flag | 说明 |
| --- | --- |
| `--tools <tools...>` | 指定可用工具集(`""` 禁用全部、`default` 启用全部、或显式名单) |
| `--allowedTools, --allowed-tools <tools...>` | 允许列表(如 `"Bash(git *) Edit"`) |
| `--disallowedTools, --disallowed-tools <tools...>` | 禁用列表 |
| `--permission-mode <mode>` | `acceptEdits` / `auto` / `bypassPermissions` / `default` / `dontAsk` / `plan` |
| `--dangerously-skip-permissions` | 跳过所有权限检查(仅推荐沙盒+无外网环境) |
| `--allow-dangerously-skip-permissions` | 允许会话内启用上述跳过模式(默认不开) |
| `--disable-slash-commands` | 禁用所有 skill |

## Agents / Skills / 插件

| Flag | 说明 |
| --- | --- |
| `--agent <agent>` | 当前会话使用的 agent 配置 |
| `--agents <json>` | 内联定义自定义 agent |
| `--plugin-dir <path>` | 仅本会话加载某个插件目录或 .zip(可重复) |
| `--plugin-url <url>` | 从 URL 拉取 .zip 插件(可重复) |

## MCP

| Flag | 说明 |
| --- | --- |
| `--mcp-config <configs...>` | 加载 MCP servers 的 JSON 文件或字符串 |
| `--strict-mcp-config` | 仅使用 `--mcp-config` 提供的 servers,忽略其他来源 |
| `--mcp-debug` | 已废弃,请用 `--debug` |

## 输出与流式

| Flag | 说明 |
| --- | --- |
| `-p, --print` | 输出后退出(适合 pipe / CI) |
| `--input-format <format>` | `text`(默认) / `stream-json` |
| `--output-format <format>` | `text`(默认) / `json` / `stream-json` |
| `--include-partial-messages` | 流式输出中包含部分消息分块(`--print` + `stream-json`) |
| `--include-hook-events` | 输出流中包含 hook 生命周期事件(`stream-json` 下) |
| `--replay-user-messages` | stdin 用户消息回显到 stdout(stream-json 双向时使用) |
| `--json-schema <schema>` | 用 JSON Schema 校验结构化输出 |
| `--betas <betas...>` | 注入 beta header(API key 用户) |

## 设置文件

| Flag | 说明 |
| --- | --- |
| `--settings <file-or-json>` | 加载额外的 settings JSON 文件或字符串 |
| `--setting-sources <sources>` | 限定加载哪几层设置:`user,project,local` |

## Worktree / 终端

| Flag | 说明 |
| --- | --- |
| `-w, --worktree [name]` | 创建新 git worktree 并在其中开会话 |
| `--tmux` | 配合 `--worktree`,创建对应 tmux 会话(支持 iTerm2 原生面板) |
| `--ide` | 启动时自动接入 IDE(若仅有一个有效 IDE) |

## 调试与诊断

| Flag | 说明 |
| --- | --- |
| `-d, --debug [filter]` | 调试模式;过滤如 `"api,hooks"` 或 `"!1p,!file"` |
| `--debug-file <path>` | 把 debug log 写入文件(隐式开启 debug) |
| `--verbose` | 覆盖 verbose 设置 |
| `-v, --version` | 输出版本号 |
| `-h, --help` | 显示帮助 |

## 远程控制 / Chrome / Brief

| Flag | 说明 |
| --- | --- |
| `--remote-control [name]` | 启用远程控制 |
| `--remote-control-session-name-prefix <prefix>` | 远程控制会话名前缀(默认主机名) |
| `--chrome` / `--no-chrome` | 启用/禁用 Chrome 集成 |
| `--brief` | 启用 SendUserMessage 工具(agent 主动发消息给用户) |

## 子命令

| 命令 | 说明 |
| --- | --- |
| `agents` | 管理后台 agent 会话 |
| `auth` | 管理认证 |
| `auto-mode` | 查看 auto mode 分类器配置 |
| `doctor` | 自更新器健康检查 |
| `install [target]` | 安装原生构建(`stable` / `latest` / 指定版本) |
| `mcp` | 配置与管理 MCP servers(见 [MCP 章节](../advanced/mcp-servers)) |
| `plugin` / `plugins` | 管理插件(install / enable / disable / list / update / marketplace) |
| `project` | 管理项目状态 |
| `setup-token` | 配置长效认证 token(需 Claude 订阅) |
| `ultrareview [target]` | 云端多 agent 代码 review(可传 PR 号 / 基准分支) |
| `update` / `upgrade` | 检查并安装更新 |

每个子命令都支持 `claude <command> --help` 查看完整选项。

## 常用环境变量

| 变量 | 说明 |
| --- | --- |
| `ANTHROPIC_API_KEY` | API key 认证 |
| `ANTHROPIC_BASE_URL` | 自定义 API 端点(代理 / 第三方部署) |
| `ANTHROPIC_AUTH_TOKEN` | 部分代理使用的鉴权 header(代替 API key) |
| `CLAUDE_CODE_SIMPLE` | `--bare` 模式标志(由 CLI 内部置位) |
| `DISABLE_PROMPT_CACHING` | 设为 `1` 关闭 prompt caching(默认 `0`) |

## 接下来

→ [斜杠命令字典](./slash-commands-ref)
