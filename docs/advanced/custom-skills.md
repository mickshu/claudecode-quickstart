---
title: 自定义 Skills
description: 写一个属于你或团队的 skill
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 自定义 Skills

## 何时该写 skill

- **某个 prompt 你重复输入超过 3 次** → 写成 skill
- **想给团队一个标准动作**(团队 review 流程、release 流程) → 写 skill 入仓
- **某类任务有固定流程,模型容易跑偏** → 用 skill 锁定步骤

不该写 skill 的场景:

- 一次性需求(直接 prompt 即可)
- 应当用 hook 完成的确定性自动化(format、阻断)
- 对 UI 状态的切换(用内置 / 命令)

## 目录与文件

**用户级**:`~/.claude/skills/<skill-name>/SKILL.md`

**项目级**:`<repo>/.claude/skills/<skill-name>/SKILL.md`(入仓共享)

最小结构:

```
~/.claude/skills/say-hi/
└── SKILL.md
```

复杂的可以加 helpers / examples 子文件,被 SKILL.md 引用:

```
~/.claude/skills/release/
├── SKILL.md
├── checklist.md
└── examples/
    └── 1.2.3.md
```

## SKILL.md 结构

```markdown
---
name: say-hi
description: 用一句简短中文打招呼
---

# say-hi

被触发时:

1. 用一句简洁的中文向用户问好
2. 询问今天的目标
3. 不要调用任何工具

不要超过 3 行。
```

> `description` 决定何时被自动触发 / 何时被推荐。写得**具体**,模型才能正确判断匹配。

## 自动触发(可选)

部分 skill 注册了"何时该自动加载"的提示。版本不同字段略有差异,常见模式:

```yaml
---
name: claude-api
description: |
  TRIGGER when: 代码 import anthropic / @anthropic-ai/sdk;
  用户问 Claude API / Anthropic SDK / Managed Agents;
  添加/修改 prompt caching / thinking / tool use 等 Claude 特性。
  SKIP: 文件 import openai / 其他 provider SDK;通用 ML 问题。
---
```

description 中带 TRIGGER / SKIP 段,让 harness 的匹配机制更精准。具体支持以官方为准。

## 项目级 skill 实例:发版前清单

`<repo>/.claude/skills/pre-release/SKILL.md`:

```markdown
---
name: pre-release
description: 发版前的标准化检查清单
---

# pre-release

按以下步骤逐一执行,**每一步完成后让用户确认再做下一步**:

1. 跑全量测试:`pnpm test`
2. 跑类型检查:`pnpm typecheck`
3. 跑 e2e:`pnpm test:e2e`
4. 看一眼 changelog:用户改过 CHANGELOG.md 吗?
5. 比对 main 分支:本分支落后多少 commit?
6. 确认 SemVer:这次该升 patch / minor / major?
7. 生成 git tag 草稿(暂不打 tag),让用户确认

不要直接打 tag、不要直接 publish、不要 push。最终一步是给一份"接下来用户该手动做什么"。
```

入仓后,团队所有人都能 `/pre-release` 触发。

## 测试 skill

```
/say-hi
```

如果没触发,看:

1. 文件是否在正确目录(`~/.claude/skills/<name>/SKILL.md`)
2. frontmatter 是否合法(`name` / `description` 必填)
3. 重启 CLI(部分情况要)
4. `claude --debug` 看加载日志

## 写好 skill 的几条原则

1. **指令具体**:不要写"做得好",写"按 X 步骤、用 Y 工具、不超过 Z 字"
2. **限定边界**:列**不要做**什么(特别是危险动作)
3. **要求人确认**:涉及推送、发布、发邮件的步骤,必须 stop 等用户
4. **失败可恢复**:每步给"如果失败怎么办"
5. **少调工具**:跟主对话风格一致,不要 skill 自己跑大量额外工具污染上下文

## 反模式

❌ **skill 太大太杂**:`mega-helper` 干 10 件事 → 拆成 10 个小 skill

❌ **skill 内套 skill**:互相调用容易死循环

❌ **skill 替代 hook**:格式化、阻断这些用 hook,skill 不可靠

❌ **不写 description 直接靠 name**:模型无法判断何时该用

## Plugin / Marketplace

Claude Code 有 plugin 机制,把 skill / hook / agent 打包分发:

```bash
claude plugin install <plugin-name>
claude plugin list
claude plugin enable <name>
claude plugin disable <name>
```

详见 `claude plugin --help`。Plugin 适合**对外发布**;团队内部直接入仓 `.claude/skills/` 更轻。

## 接下来

→ [自定义键位](./keybindings)
