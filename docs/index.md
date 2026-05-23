---
layout: home

hero:
  name: Claude Code 使用手册
  text: 从入门到精通的中文参考
  tagline: 覆盖 Claude Code CLI、Claude Agent SDK 与 Claude API 的完整生态指南
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started/
    - theme: alt
      text: 核心概念
      link: /core-concepts/
    - theme: alt
      text: 术语表
      link: /reference/glossary

features:
  - icon: 🚀
    title: 入门到上手
    details: 从安装登录到第一次对话,5 分钟跑通 Claude Code,理解 CLI / 桌面端 / Web / IDE 四种形态。
    link: /getting-started/
    linkText: 进入入门部分

  - icon: 🧠
    title: 核心概念清晰
    details: 工具体系、斜杠命令、Skills、CLAUDE.md、自动记忆、子代理 —— 一次理清所有底层模型。
    link: /core-concepts/
    linkText: 阅读核心概念

  - icon: 🛠️
    title: 实战工作流
    details: Bug 修复、代码审查、跨文件重构、测试生成、PR 提交,均以端到端真实案例呈现。
    link: /workflows/
    linkText: 查看工作流

  - icon: ⚙️
    title: 进阶定制
    details: settings.json、hooks、自定义 skills、键位、MCP、worktree —— 把 Claude Code 调教成你的样子。
    link: /advanced/
    linkText: 解锁进阶能力

  - icon: 🏢
    title: 团队与企业
    details: 共享配置、CI 集成、安全合规、成本控制 —— 让 Claude Code 在团队里规模化运行。
    link: /team/
    linkText: 团队最佳实践

  - icon: 🌐
    title: 生态扩展
    details: Claude Agent SDK 构建自定义 agent、Claude API 直接调用、Prompt Caching 等高级特性。
    link: /ecosystem/
    linkText: 探索生态

  - icon: 📚
    title: 参考与术语表
    details: CLI 参数、斜杠命令、工具矩阵、settings 字段、hook 事件、中英术语表,一站式查阅。
    link: /reference/
    linkText: 跳转参考章节
---

## 关于本手册

本手册基于 **Claude Code(Opus 4.7,2026 年版本)** 编写,采用以下原则:

- **以中文为主体**,术语首次出现时给出英文括注,统一在 [术语表](/reference/glossary) 中维护对照。
- **以本地实证为准**:所有具体命令、配置字段都通过 `claude --help`、`~/.claude/` 实际状态、官方文档交叉核对,避免训练数据中的旧信息误导读者。
- **每章顶部标注 `lastVerified`**,标识内容核对时间与依据版本,便于读者判断时效性。

::: tip 阅读建议
新手请按 **入门 → 核心概念 → 工作流** 的顺序阅读;有经验的开发者可直接跳到 **进阶** 或 **生态** 章节;
团队管理者建议从 **团队** 章节开始,再回看 **进阶** 中的权限与 hooks 部分。
:::

::: warning 版本提示
Claude Code、Agent SDK、Claude API 都在快速演进中。如遇本手册描述与实际命令/界面不符,请以 `claude --help` 输出和 [docs.claude.com](https://docs.claude.com/) 为准,并欢迎在仓库提 Issue 反馈。
:::
