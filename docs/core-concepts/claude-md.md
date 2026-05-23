---
title: CLAUDE.md 项目记忆
description: 项目级配置文件的层级查找与写作规范
lastVerified: 2026-05 / Claude Code 2.1.148
---

# CLAUDE.md 项目记忆

`CLAUDE.md` 是 Claude Code 进入项目时**自动读入并注入到系统提示**的"项目使用说明书"。它让 Claude 一开口就知道:

- 这个项目是干什么的
- 用什么命令跑测试 / 启动 / 部署
- 团队约定(命名、目录、提交风格)
- 已知坑、敏感目录

## 层级查找

启动会话时,harness 按以下顺序读入(都存在则**全部合并**):

1. `~/.claude/CLAUDE.md` — 用户全局
2. 仓库根目录 `CLAUDE.md` — 项目共享(入仓)
3. 仓库根 `.claude/CLAUDE.md` — 项目共享(可选位置)
4. **当前工作目录到仓库根之间各级**的 `CLAUDE.md` — 子目录可针对模块覆盖

::: tip 子目录 CLAUDE.md
进入 `services/auth/` 后,该目录的 `CLAUDE.md` 会和根的合并 —— 用来给某个微服务/子模块单独写注意事项,不污染整体说明。
:::

## 写什么

✅ **该写**:

- **项目用途** —— 一两句话(电商订单服务 / 内部 BI 后台 / VS Code 扩展…)
- **关键命令** —— 跑测试、启动、构建、lint 的完整命令(连参数)
- **目录约定** —— `src/` 是什么、`packages/` 怎么分
- **代码风格** —— 缩进、命名、是否允许某种语法
- **已知陷阱** —— "不要碰 X 文件"、"Y 模块的测试要先 docker compose up"
- **依赖外部服务** —— 哪些功能需要本地起 db / mock / VPN
- **团队约定** —— PR 模板、commit 风格、分支策略

❌ **不该写**:

- 凭据、API key、密钥
- 个人偏好(写在 `~/.claude/CLAUDE.md` 或 auto-memory 里)
- 流水账式更新日志(写到 changelog 里)
- 临时调试笔记(任务完了删掉,别留下)
- 已经能从代码自动推断的内容(目录结构 `tree` 一下就知道,不用复述)

## 写作模板

```markdown
# Project Name

订单服务,Node.js + TypeScript + Postgres。

## Commands

- 安装:`pnpm install`
- 开发:`pnpm dev`
- 测试:`pnpm test`(集成测试需要本地 Postgres,见下)
- 类型检查:`pnpm typecheck`
- 构建:`pnpm build`

## Local setup

集成测试依赖本地 Postgres:

```bash
docker compose up -d postgres
pnpm db:migrate
```

## Conventions

- 所有 Postgres 查询用 `src/db/queries/` 下的函数,不要在 service 层直接拼 SQL
- 日期一律用 UTC,展示层再转本地时区
- 错误用 `AppError` 类抛出,不要用裸 `Error`

## Gotchas

- `src/legacy/` 是要废弃的代码,**不要继续往里加东西**
- `scripts/migrate.sh` 是生产用的,本地开发用 `pnpm db:migrate`
- 依赖 Redis,本地无 Redis 时 `payments` 模块测试会跳过
```

## 用 `/init` 自动生成

进入新项目第一次会话:

```
/init
```

Claude 会:

1. 扫一眼仓库结构、`package.json` / 等配置文件
2. 生成一份 `CLAUDE.md` 草稿
3. 问你哪里需要修正

::: warning 别裸跑 /init
`/init` 是好起点,**不是终点**。生成后务必人工通读、删掉无关段落、补上只有团队知道的细节。
:::

## 与 auto-memory 的边界

| 场景 | 写 `CLAUDE.md` | 写 auto-memory |
| --- | --- | --- |
| 项目客观信息(命令、约定) | ✅ | ❌ |
| 用户个人偏好 | ❌ | ✅(user 类) |
| 团队反复纠正 Claude 的方式 | ✅(项目共享) | ✅(feedback 类,跨项目时更合适) |
| 临时项目阶段 / 进度 | ❌ | ✅(project 类) |
| 外部系统指针(Linear / Grafana URL) | 部分 ✅ | ✅(reference 类) |

详见 [跨会话自动记忆](./auto-memory)。

## 反模式

- **每次新事情都加一段** → 文件越来越大,Claude 上下文被吃光。**定期精简**,把不再相关的删掉。
- **写"Claude 应该…"** → 写客观事实和命令,不要写关于 Claude 的元指令。元指令应当放在 skill 或 system prompt 里。
- **用 CLAUDE.md 当 wiki** → wiki 应在 Notion / Confluence。`CLAUDE.md` 只放"让 Claude 帮你干活时它最该知道的最少信息"。

## 接下来

→ [跨会话自动记忆](./auto-memory)
