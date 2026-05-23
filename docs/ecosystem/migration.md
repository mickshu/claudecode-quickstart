---
title: 跨模型版本迁移
description: 4.5 → 4.6 → 4.7 的兼容性提示
lastVerified: 2026-05
---

# 跨模型版本迁移

## 模型档次速记

```
档次:       Opus  >  Sonnet  >  Haiku
最新代:     4.7      4.6        4.5
特点:       重思考   平衡       快/便宜
```

## 当前推荐 ID

| 模型 | 完整 ID | 别名 |
| --- | --- | --- |
| Opus 4.7 | `claude-opus-4-7` | `opus` |
| Sonnet 4.6 | `claude-sonnet-4-6` | `sonnet` |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | `haiku` |

::: tip 别名 vs 完整 ID
- `opus` / `sonnet` / `haiku` 别名总是指向**当前最新**版本
- 完整 ID 指向具体版本,**生产环境推荐**用完整 ID,避免某天升级带来的隐式行为变化
:::

## 4.5 → 4.6 → 4.7 总体趋势

每代提升通常包含:

- **更强的推理 / 工具调用**:thinking 链路更稳、tool_use 更精确
- **更长的上下文 / 更高效的 cache**
- **prompt 表达更宽容**:旧版需要"很魔法"的措辞,新版直白即可

## 通用迁移检查清单

切换模型版本前:

- [ ] **跑一次 evals**:用同样的输入跑新旧两个版本,对比输出
- [ ] **看 system prompt 是否还需要那些"hack"**:旧版的某些哄骗式表达可能新版不再需要,删掉反而更好
- [ ] **核对 tool_use 行为**:特别是含复杂 schema 的工具
- [ ] **核对 thinking 行为**:开启 thinking 后输出形态是否符合预期
- [ ] **更新 prompt cache 的 breakpoint**:新版 cache 行为略有变化时
- [ ] **重新测试输出格式**:JSON 模式 / 严格 schema 是否仍稳

## 模型间 prompt 兼容性

通常 **新模型对旧 prompt 高度兼容**。但反过来 —— 把为新模型优化的 prompt 给旧模型 —— 可能效果显著下降。

如果你的项目同时支持多版本(让用户选模型),建议:

- **共享 prompt** 写得保守、明确、不依赖特定版本的"暗能力"
- **版本特定 prompt** 用 feature flag 切换

## 工具/功能可用性矩阵(示意)

| 特性 | 4.5 | 4.6 | 4.7 |
| --- | --- | --- | --- |
| Tool use | ✅ | ✅ | ✅ |
| Extended thinking | ✅(部分档) | ✅ | ✅ |
| Prompt caching | ✅ | ✅ | ✅ |
| Vision(图片输入) | ✅ | ✅ | ✅ |
| Citations | ✅ | ✅ | ✅ |
| Batch API | ✅ | ✅ | ✅ |
| Files API | ✅(部分) | ✅ | ✅ |

::: warning 具体特性请以 docs.claude.com 为准
矩阵会随版本调整,本表只是大致示意。实际生产前去看官方 release notes 与 model cards。
:::

## 迁移到 Claude Code

很多用户从 Cursor / Copilot 迁来,常见困惑:

- **Claude Code 没有"行内补全"** —— 这是设计选择,Claude Code 聚焦"任务级协作",不取代行内补全工具
- **Claude Code 主要在终端** —— 习惯 IDE 的可以装 IDE 扩展,但功能仍主要从 CLI 派生
- **会话状态以"会话"为单位** —— 不像 Cursor 那样每次提问都"全局可见",Claude Code 鼓励**短会话 + `/clear`**

## 一段实战:从 Sonnet 4.6 切到 Opus 4.7

```
原:
  agent = Agent(model="claude-sonnet-4-6", ...)

新:
  agent = Agent(model="claude-opus-4-7", ...)
```

预期变化:

- ✅ 复杂推理更稳
- ⚠️ 单价提升,**budget / max-tokens 同步评估**
- ⚠️ 默认 cache 命中相同前缀,首次升级会有一段 cache_creation 的"破冰期",成本短期飙升,1-2 天稳定

迁移建议:

1. **灰度 1-5%** 流量
2. 对比 evals
3. 调 prompt(可能更直接、更短)
4. 全量

## 反模式

❌ **盲目升 Opus 寻求更好效果** —— 多数场景 Sonnet 已足够,Opus 更贵且未必更好(尤其简单任务)

❌ **直接 prod 切换不灰度** —— 隐式行为变化会咬人

❌ **不更新 prompt** —— 新模型可能对旧 prompt 中的"魔法表达"反应不同

❌ **把模型 ID 写死在很多地方** —— 集中到一个常量 / 配置项,迁移时改一处

## 接下来

生态部分结束。继续 → [参考与附录](/reference/) 查具体字段表与 FAQ。
