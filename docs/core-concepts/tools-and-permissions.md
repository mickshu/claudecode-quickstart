---
title: 工具与权限
description: Claude Code 的工具体系和权限模式
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 工具与权限

## 工具(Tools)是什么

Claude 模型自身只能"思考",**不能直接读写你的文件、跑命令、访问网络**。所有这些动作都通过"工具调用"完成 —— 模型生成一个 tool_use 请求,harness(Claude Code 进程)在本地执行,把结果返回给模型。

## 内置工具一览

| 工具 | 用途 | 关键参数 | 风险 |
| --- | --- | --- | --- |
| **Read** | 读文件(支持图片/PDF/notebook) | `file_path` / `offset` / `limit` / `pages` | 只读,低风险 |
| **Edit** | 精确字符串替换 | `file_path` / `old_string` / `new_string` / `replace_all` | 修改文件 |
| **Write** | 写/覆盖文件 | `file_path` / `content` | 可能覆盖 |
| **NotebookEdit** | 编辑 Jupyter cell | `notebook_path` / `cell_id` / ... | 修改文件 |
| **Bash** | 执行 shell 命令 | `command` / `timeout` / `run_in_background` | **最高风险** |
| **Glob** | 按文件名 pattern 查找 | `pattern` / `path` | 只读 |
| **Grep** | 内容搜索(基于 ripgrep) | `pattern` / `path` / `glob` | 只读 |
| **WebFetch** | 抓取 URL 并按 prompt 处理 | `url` / `prompt` | 网络 |
| **WebSearch** | 网络搜索 | `query` | 网络 |
| **Agent** | 派生子代理 | `subagent_type` / `prompt` | 取决于子代理 |
| **TaskCreate / TaskUpdate / TaskList** | 任务清单 | — | 仅本地状态 |
| **TaskOutput / TaskStop** | 后台任务 IO | — | 取决于任务 |
| **EnterPlanMode / ExitPlanMode** | 规划模式 | — | 仅状态 |
| **EnterWorktree / ExitWorktree** | git worktree 隔离 | `name` / `path` / `action` | 创建/删除分支 |
| **CronCreate / CronDelete / CronList** | 定时调度 | `cron` / `prompt` | 触发未来任务 |
| **ScheduleWakeup** | /loop 动态调度 | `delaySeconds` / `prompt` | 触发未来任务 |
| **AskUserQuestion** | 弹选项问用户 | `questions` | 阻塞等待人 |
| **Skill** | 调起 skill | `skill` / `args` | 取决于 skill |

::: tip 用专用工具,不要"什么都用 Bash"
读文件用 `Read`,改文件用 `Edit/Write`,搜索用 `Grep/Glob`。把 `Bash` 留给真正需要 shell 的场景(git、构建、运行测试)。这能让用户更容易审阅 Claude 的每一步,也能避免 `cat | sed` 类操作触发 shell 风险。
:::

## 权限模型

每次工具调用前,harness 会按以下规则决定:

```
1. 这个工具+参数是否在 settings.json 的 permissions.deny 中? → 拒绝
2. 是否在 permissions.allow 中?                              → 直接放行
3. 是否在 permissions.ask 中?                                → 弹出确认
4. 看当前 permission-mode 默认行为
```

### 五种 permission-mode

| 模式 | 别名 / flag | 行为 |
| --- | --- | --- |
| `default` | (默认) | 修改类工具询问,只读放行 |
| `acceptEdits` | — | 编辑类自动放行,Bash 仍询问 |
| `plan` | `--permission-mode plan` | **完全只读**,不允许任何修改 |
| `bypassPermissions` | `--dangerously-skip-permissions` | **全部跳过**,沙盒/CI 用 |
| `auto` / `dontAsk` | (内部模式) | harness 自动决策 |

按 **Shift+Tab** 在交互模式中循环。

### 权限规则的写法

`settings.json` 中的 `permissions.allow / ask / deny` 都是数组,元素是 **"工具名"** 或 **"工具名(参数 pattern)"**:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(npm test:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(rm:*)"
    ],
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(curl:*|sh)"
    ]
  }
}
```

详细字段见 [settings 字段表](/reference/settings-schema)。

## 自定义工具子集(`--tools`)

启动时限制可用工具:

```bash
# 完全无工具
claude --tools "" "解释这段代码: ..."

# 仅允许读和搜索
claude --tools "Read,Grep,Glob,WebFetch"

# 默认全部
claude --tools "default"
```

适合非交互式场景的安全收紧。

## 工具调用过程示意

```
你: 帮我看看 utils.ts 里的 normalizeName 函数

Claude:
  ↓ 决策调用 Grep("normalizeName", path: "src")
  harness: [permission check] → 放行(Grep 在 allow 里)
  harness: 执行 ripgrep,返回匹配行
  ↓ 决策调用 Read("src/utils.ts", offset: 40, limit: 30)
  harness: [permission check] → 放行
  harness: 返回文件内容
  ↓ 综合,生成回答
回答:这个函数做了三件事 ...
```

## 接下来

→ [斜杠命令](./slash-commands)
