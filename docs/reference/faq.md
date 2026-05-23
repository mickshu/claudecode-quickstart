---
title: 常见问题
description: 安装、登录、权限、成本、记忆、SDK 高频问题
lastVerified: 2026-05 / Claude Code 2.1.x
---

# 常见问题

## 安装与启动

### Q: macOS 上 `claude` 命令找不到怎么办?

`npm i -g @anthropic-ai/claude-code` 之后,确保 `npm bin -g` 在 `PATH` 里。或直接:

```bash
which claude || echo "$(npm config get prefix)/bin"
```

把上面的目录加到 `~/.zshrc` 的 `PATH`。

### Q: 启动报 `ANTHROPIC_API_KEY not set`,但我已经登录了?

登录有两种:OAuth(`claude /login`)和 API key(`export ANTHROPIC_API_KEY=...`)。如果用了 OAuth,`--bare` 模式会**强制要求** API key。退出 `--bare`,或单独配 API key。

### Q: Windows 上是不是只能用 WSL?

推荐 WSL2。原生 Windows 也可用,但 hook / MCP 的 shell 兼容性弱。开发环境用 WSL,生产 CI 用 Linux runner。

## 登录与认证

### Q: API key vs Console 登录,推荐哪种?

| 场景 | 推荐 |
| --- | --- |
| 个人 / 团队订阅 | Console OAuth(自动续期) |
| CI / 服务器 | API key(可吊销,免交互) |
| 第三方代理(Bedrock / Vertex / 自托管) | 各自 SDK 路径 + 自己的凭证 |

### Q: 团队共享 API key 安全吗?

不要。每人一个 key,便于审计与吊销。组织级用 Anthropic Console 的成员管理。

## 权限与安全

### Q: 我设了 `deny: ["Bash(rm -rf *)"]`,但模型还是想跑 `rm -rf` 怎么办?

`deny` 不是阻止模型**想**做某事,只是阻止 harness 执行。模型尝试时会被 harness 拒绝并把信息回传——这是正常的。

### Q: 怎么阻止模型 `git push --force` 到 main?

在 `.claude/settings.json`:

```json
{
  "permissions": {
    "ask": ["Bash(git push *)"],
    "deny": ["Bash(git push --force *)", "Bash(git push -f *)"]
  }
}
```

更严的做法:加 `PreToolUse` hook,正则匹配 `git push.*--force` 直接 exit 2。

### Q: bypassPermissions 模式安全吗?

仅在**断网沙盒**或**完全可信脚本**里用。一般开发请用 `default` 或 `acceptEdits`,后者只跳过文件编辑确认,危险操作仍拦截。

## 成本

### Q: 一次会话花了多少钱?

`/cost` 命令。也可以看 `~/.claude/usage/` 下的累计统计。

### Q: 怎么把成本压低?

- 默认开 prompt caching(默认就是开)
- 简单任务用 `--effort low` 或切 Sonnet/Haiku
- 长任务先用 Plan / Explore agent 规划,再针对性写
- 不要把整个 monorepo `--add-dir`,只加相关目录

详见 [成本控制](../team/cost-controls)。

### Q: 为什么切 Opus 之后第一次会话特别贵?

新模型对应的 cache_creation 段重新计费,一般 1-2 天进入稳态。详见 [跨模型版本迁移](../ecosystem/migration)。

## 上下文与记忆

### Q: 上下文是不是聊久了就会"忘"?

会话进入压缩(compaction)。长会话推荐:

- 阶段性 `/clear` 重启
- 关键决策落到 `CLAUDE.md`(项目级)或自动记忆(跨会话)
- 大文件用 `@<path>` 临时引用,不要塞进 system prompt

### Q: `CLAUDE.md` 和自动记忆有什么区别?

| | `CLAUDE.md` | 自动记忆 |
| --- | --- | --- |
| 范围 | 当前项目 | 跨所有项目(用户级)|
| 维护 | 手动写入 | Claude 自动维护 |
| 入仓 | 通常入仓共享 | 永远不入仓(`~/.claude/`) |
| 适合 | 项目惯例、架构、命令 | 用户偏好、反馈、长期上下文 |

详见 [CLAUDE.md](../core-concepts/claude-md) 与 [自动记忆](../core-concepts/auto-memory)。

## 工具与 skill

### Q: 自定义 skill 怎么写?

最简:

```
~/.claude/skills/my-skill/SKILL.md
```

frontmatter 含 `name` / `description` / `userInvocable: true`,正文写 prompt。详见 [自定义 skill](../advanced/custom-skills)。

### Q: skill 和 hook 用哪个?

- 模型**主动判断后调用** → skill
- 事件**触发后强制执行** → hook

### Q: MCP server 配好了,`/mcp` 看不到?

```bash
claude mcp list           # 列出
claude mcp get <name>     # 查具体
claude --debug mcp        # 启动时打印 MCP 加载日志
```

详见 [MCP servers](../advanced/mcp-servers)。

## SDK 与 API

### Q: Agent SDK 和 Claude Code 是什么关系?

Claude Code CLI 本身就是用 Agent SDK 构建的。SDK 暴露同样的能力(tool use / hooks / streaming / cache),让你做自己的 agent。详见 [Agent SDK 简介](../ecosystem/agent-sdk-intro)。

### Q: API 直接调和 SDK 调有什么区别?

API 是底层 HTTP,你要自己写 tool loop。SDK 帮你封装 loop / 缓存 / 工具注册 / 流式分发。**轻量集成可以直接 API,做 agent 用 SDK**。

### Q: 模型 ID 老变,生产里写哪个?

- 别名(`opus` / `sonnet` / `haiku`)→ 跟着升,适合开发
- 完整 ID(`claude-opus-4-7`)→ 锁版本,适合生产

详见 [跨模型版本迁移](../ecosystem/migration)。

## 团队与 CI

### Q: 公司禁止访问 api.anthropic.com 怎么办?

走 Bedrock / Vertex / Foundry,或公司内自建代理。详见 [组织部署](../team/org-setup)。

### Q: 怎么在 GitHub Actions 里跑 Claude Code?

`claude --print` + `--max-budget-usd` + `ANTHROPIC_API_KEY` 走 Secrets。详见 [CI 集成](../team/ci-integration)。

### Q: 团队里的 `.claude/settings.json` 应不应该入仓?

应该。**项目共用部分**(允许的工具、agent 定义、hooks)入仓。**个人/敏感部分**(API key、本地路径)放 `settings.local.json` 并 `.gitignore`。详见 [团队共享配置](../team/shared-config)。

## 接下来

→ [勘误与版本](./changelog)
