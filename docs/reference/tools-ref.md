---
title: 工具能力矩阵
description: Claude Code 内置工具的字段、作用、注意事项
lastVerified: 2026-05 / Claude Code 2.1.x
---

# 工具能力矩阵

::: tip 工具与权限
本章只罗列工具能力。**它们是否被允许执行**取决于权限模式与 settings.json 的 allow/ask/deny 规则,见 [工具体系与权限](../core-concepts/tools-and-permissions)。
:::

## 一览

| 工具 | 类型 | 副作用 | 典型用途 |
| --- | --- | --- | --- |
| `Read` | 只读 | 无 | 读文件、读图片、读 PDF、读 Jupyter |
| `Edit` | 写 | 有 | 精确字符串替换式修改 |
| `Write` | 写 | 有 | 创建 / 完整覆盖文件 |
| `NotebookEdit` | 写 | 有 | 编辑 .ipynb 单元格 |
| `Bash` | 执行 | 有 | 运行 shell 命令(可后台) |
| `Agent` | 派发 | 视子任务 | 启动子代理(Explore / Plan / general-purpose / 自定义) |
| `WebFetch` | 网络 | 读 | 抓取 URL 内容并交小模型解读 |
| `WebSearch` | 网络 | 读 | 联网搜索(美区) |
| `TaskCreate` / `TaskList` / `TaskGet` / `TaskUpdate` | 状态 | 写本地状态 | 任务管理 |
| `TaskOutput` / `TaskStop` | 状态 | 读/中止 | 后台任务管理 |
| `AskUserQuestion` | 交互 | 阻塞 | 中途询问用户 |
| `EnterPlanMode` / `ExitPlanMode` | 模式 | 改会话 | 进入 / 退出计划模式 |
| `EnterWorktree` / `ExitWorktree` | 隔离 | 改 cwd | 切入 / 离开 git worktree |
| `Skill` | 派发 | 视 skill | 调用某个 skill |
| `CronCreate` / `CronList` / `CronDelete` | 定时 | 写状态 | 定时唤起任务 |
| `ScheduleWakeup` | 定时 | 写状态 | 在 `/loop dynamic` 模式下安排回唤 |

## 文件类

### Read

读取文件内容,返回带行号格式。

- `file_path` **必须是绝对路径**
- 默认前 2000 行;超长文件用 `offset` + `limit`
- 支持图片(PNG/JPG/...)、PDF(`pages: "1-5"`,>10 页必须指定)、Jupyter notebook
- 不能读目录,不能在编辑后回读自己的修改(harness 会跟踪状态)

### Edit

精确字符串替换。

- `old_string` 必须**唯一**或使用 `replace_all: true`
- `new_string` 必须与 `old_string` 不同
- 编辑前**必须**至少调用过一次 `Read` 该文件
- 保留原行的缩进/制表符

### Write

写入或完整覆盖文件。

- 已存在文件必须先 `Read`
- 优先用 `Edit` 增量修改,只在新建或完整重写时用 `Write`
- **不要主动创建 README / 文档**,除非用户明确要求

### NotebookEdit

编辑 Jupyter notebook 单元格。

- `notebook_path` 必须绝对路径
- `cell_number` 0-indexed
- `edit_mode`: `replace`(默认) / `insert` / `delete`

## 执行类

### Bash

运行 shell 命令。

| 字段 | 说明 |
| --- | --- |
| `command` | 实际命令 |
| `description` | 简短描述(展示给用户) |
| `timeout` | 毫秒,最大 600000(10 分钟) |
| `run_in_background` | 是否后台执行 |
| `dangerouslyDisableSandbox` | 谨慎使用,绕过 sandbox |

注意:

- 优先用 `Read` / `Edit` / `Write`,**不要**用 `cat` / `sed` / `awk` / `echo >` 替代
- 含空格路径必须双引号
- 多个独立命令应在一条消息里并行调用(多个 tool use block),不要 `cmd1 && cmd2` 强行串联
- `find` 时从 `.` 起步,不要从 `/`

## 子代理与任务

### Agent

派一个子代理。

| 字段 | 说明 |
| --- | --- |
| `subagent_type` | `Explore` / `Plan` / `general-purpose` / `claude` 或自定义 agent 名 |
| `description` | 3-5 词概要 |
| `prompt` | 任务说明(子代理看不到主对话历史) |
| `run_in_background` | 后台执行 |
| `model` | 可覆盖模型 |
| `isolation` | `worktree` 时在新 git worktree 中运行 |

### TaskCreate / TaskList / TaskGet / TaskUpdate

主对话内的任务追踪体系,适合多步任务。

- `TaskCreate`:`subject` / `description` / `activeForm`
- `TaskUpdate`:`status` 流转 `pending → in_progress → completed`,或 `deleted`
- `addBlocks` / `addBlockedBy` 表达依赖

## 网络类

### WebFetch

抓取 URL 内容并交小模型解读后返回。

- 不能用于鉴权站(GitHub PR / Google Docs 等)
- HTTP 自动升级 HTTPS
- GitHub URL **应改用 `gh` CLI**

### WebSearch

联网搜索。仅美区可用。**响应必须包含 `Sources:` 段**列出引用 URL。

## 模式与隔离

### EnterPlanMode / ExitPlanMode

切换计划模式。计划模式下不允许写工具(Edit / Write / NotebookEdit / 部分 Bash)。

### EnterWorktree / ExitWorktree

仅在用户**明确**要求"使用 worktree"时调用。`ExitWorktree` 的 `action`:

- `keep`:保留分支与目录
- `remove`:删除(若有未提交内容,需 `discard_changes: true`)

## 交互

### AskUserQuestion

最多 4 个问题,每个 2-4 个选项;UI 会自动加 "Other"。`multiSelect` 控制单/多选。

不要用它问"我的方案 OK 吗?"——那是 `ExitPlanMode` 的职责。

## 定时

### CronCreate / CronList / CronDelete

5 字段 cron 本地时区。`recurring: false` 一次性,`durable: true` 持久化。

### ScheduleWakeup

仅 `/loop` 动态模式下使用,延迟 60-3600 秒。

## 接下来

→ [settings 字段表](./settings-schema)
