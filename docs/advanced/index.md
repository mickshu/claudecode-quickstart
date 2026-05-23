---
title: 进阶定制
description: 通过 settings、hooks、自定义 skills、MCP、worktree 把 Claude Code 调教成你的样子
lastVerified: 2026-05 / Opus 4.7
---

# 进阶定制

读完本部分,你应当能:

- 用 `settings.json` 在用户 / 项目 / 本地三层精确控制权限与默认行为
- 用 hooks 让 Claude Code 在工具调用前后自动执行你指定的命令
- 写一个自定义 skill,让 `/your-skill` 可以被你或团队成员触发
- 接入 MCP 服务,把外部数据源 / 工具暴露给 Claude
- 用 worktree 隔离不同任务,避免改动相互污染

## 章节

1. [settings.json 配置](./settings-json)
2. [权限模型](./permissions)
3. [Hooks 自动化](./hooks)
4. [自定义 Skills](./custom-skills)
5. [自定义键位](./keybindings)
6. [MCP 服务接入](./mcp-servers)
7. [Worktree 隔离](./worktrees)
