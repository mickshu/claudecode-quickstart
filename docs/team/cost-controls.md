---
title: 成本控制
description: 模型选择、用量观测、预算上限
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 成本控制

## 三个关键变量

```
总成本 ≈ 模型档次 × 平均每会话 token × 会话频次
```

要降本:**优先调档次**(选对模型最便宜),**其次降单次 token**(prompt caching、清空上下文),**最后限频次**(预算上限)。

## 模型选择

| 模型 | 别名 | 适合 | 单价(相对) |
| --- | --- | --- | --- |
| **Opus 4.7** | `opus` / `claude-opus-4-7` | 重思考、跨文件重构、复杂决策 | 最高 |
| **Sonnet 4.6** | `sonnet` / `claude-sonnet-4-6` | 日常开发主力,平衡 | 中 |
| **Haiku 4.5** | `haiku` / `claude-haiku-4-5-20251001` | 批量轻任务、CI 大规模扫描、简单问答 | 最低 |

::: tip 默认 Sonnet,需要时升 Opus
日常用 `sonnet` 性价比最佳。遇到下面情况再 `/model opus`:
- 大规模重构、设计决策
- 安全审查、复杂调试
- 写规范 / 复杂方案对比
:::

切换:

```
/model sonnet
/model opus
/model haiku
/model claude-haiku-4-5-20251001
```

## fallback model

主模型挂时自动降级(仅 `--print` 非交互模式):

```bash
claude --print --model opus --fallback-model sonnet "..."
```

## prompt caching(必开)

Claude Code 默认开启 prompt caching,**不要关**。它把对话前缀缓存,下次同前缀只算 cache_read 价格(约 1/10 input)。

确认开启:

```jsonc
{ "env": { "DISABLE_PROMPT_CACHING": "0" } }
```

详见 [Prompt Caching](/ecosystem/prompt-caching)。

## 减少单次 token

### 1. 不留长会话

```
任务做完 → /clear 或 /exit → 新起会话
```

会话越长,每轮重读历史 token 越多。

### 2. 用 subagent

让 Explore agent 独立完成大量读文件,主会话上下文几乎不增。

### 3. 用 `/compact` 手动压缩

```
/compact
```

让 harness 把已对话压成总结,腾出 context。

### 4. `--exclude-dynamic-system-prompt-sections`

把每机器特定的 system prompt 段(cwd / env / git status)挪到第一条 user message,**让 prompt cache 跨用户复用**(主要给 SaaS / 团队代理场景):

```bash
claude --exclude-dynamic-system-prompt-sections
```

### 5. 关掉不需要的 betas

```jsonc
{ "env": { "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1" } }
```

(若团队对成本极度敏感、不需要 beta 特性)

## 预算上限

### 单次 `--print` 最大花费

```bash
claude --print --max-budget-usd 0.50 "..."
```

超过 \$0.5 自动中止。CI 里**必加**。

### `/cost` 查看本会话花费

```
/cost
```

输出累计输入/输出/缓存 token、本会话美元数。

## 团队 / 组织级

### 1. 组织后台限额

Anthropic Console / 团队版 / 自有代理都可以设:

- 单用户月度上限
- 单 PR / 单 session 上限
- 模型黑/白名单

### 2. 用代理网关统一限流

自有 LLM 网关:对每个 user / project 设 RPS 与日成本上限,超过返回 429 让 Claude Code 自然降级。

### 3. CI 里默认用便宜模型

```bash
# .github/workflows/claude-*.yml
claude --print --model haiku --max-budget-usd 0.10 "..."
```

PR 自动审用 sonnet,夜间扫描用 haiku。

## 反模式

❌ **总用 opus** —— 多数任务 sonnet 够用。opus 比 sonnet 贵 5x,场景错配每月烧很多

❌ **不 `/clear` 留会话好几小时** —— context 涨到几十 K,每条对话都得重读

❌ **CI 里不设 max-budget** —— 一次 prompt 死循环烧光月度预算

❌ **prompt caching 关了** —— Claude Code 的成本模型很大程度依赖 caching;关了等于 10x 价格

❌ **同一查询从 3 个 agent 都问一遍** —— 重复 token,重复账单

## 观测建议

定期(每周 / 每月)看:

- **Anthropic Console / 自有代理**的总用量、按 user / project 拆分
- **Cache hit rate**:理想 > 50%。低于这个值说明前缀变动太频繁
- **平均 input vs output**:input 远高于 output 的会话很贵,考虑用 subagent

## 接下来

团队部分结束,继续 → [生态扩展](/ecosystem/) 看 SDK / API 内容。
