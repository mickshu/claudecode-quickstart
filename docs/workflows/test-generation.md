---
title: 生成测试
description: 让 Claude 写测试并验证覆盖率
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 生成测试

让 Claude 写测试容易,**让它写好的测试**才难。本章给你一套可复用流程。

## 黄金原则

> **先让 Claude 读懂被测代码,再让它写测试。**
>
> 跳过这一步,它会编造接口、补错误的输入空间。

## 步骤

### 1. 让 Claude 通读被测代码

```
读一下 src/services/user.ts 的 formatUser 函数,告诉我:
- 输入空间(哪些字段、什么类型、可选还是必选)
- 已有的边界 case 处理
- 任何隐式假设(比如非空、有效 email 等)
不要写测试,只描述。
```

Claude 会读、grep 调用方、给一份"输入/边界 / 假设"清单。

### 2. 与 Claude 对齐测试目标

```
基于以上,我想测:
1. 标准输入下的格式化结果
2. 缺少可选字段时的回退
3. 非法输入(null / undefined / 空字符串)的明确报错

集成测试用真实 Postgres 不要 mock。单元测试可以 mock 外部 API。
```

明确**哪些测试要 mock、哪些不要**,避免它默认全 mock。

### 3. 让它写第一版

```
写第一版,跑一下,失败的告诉我原因
```

Claude:

1. `Write` 测试文件
2. `Bash("pnpm test path/to/file")`
3. 把结果给你

### 4. 看红案例

测试**首次跑通**时,人为打掉被测代码的一行,确认测试**真的会失败**。这一步至关重要 —— 不少 AI 写的测试是"永远绿"的(assert 不到位)。

```
故意把 formatUser 里 user.name 改成 user.fullname,
看测试会失败几个、报错够不够明确
```

如果 0 个失败,测试**没用**。

### 5. 覆盖率检查

```
跑覆盖率,看 user.ts 里没覆盖到的分支,补上
```

```bash
pnpm test --coverage
```

::: warning 不要为覆盖率而写
覆盖率是**指标**,不是**目标**。一个把 100 行代码全跑过但 assert 不到位的测试,比一个 30 行的真测试更糟。
:::

## 常见反模式

❌ **mock 一切**
→ 单元层全 mock,集成层也 mock,导致 prod 出问题测试发现不了。**集成测试用真实依赖**(数据库、消息队列、外部 stub),只 mock 真正不可控的(随机、时间)

❌ **永远绿的 assert**
```ts
expect(result).toBeTruthy();   // 几乎啥都通过
expect(typeof result.id).toBe('string');  // 没验证内容
```
要写**具体期望**:`expect(result.name).toBe('Alice')`。

❌ **超大测试文件**
单文件 2000 行测试,跑一次失败找半天。按场景拆 describe / 拆文件。

❌ **每次跑都生成数据**
fixtures 应**确定性**。`Date.now()` / `Math.random()` 在测试里都要锁住或注入。

## 集成测试的真实数据库流

如果项目用 Postgres + 集成测试:

```
- 起测试库:`docker compose up -d test-db`
- 跑 migrations:`pnpm db:migrate --env test`
- 测试前 truncate / 跑独立 schema
- 测试后回滚事务或 drop schema
```

让 Claude 在写测试前问清楚这套机制,**不要假定**。

## 让 hooks 自动跑测试

`PostToolUse` hook 可以在每次 `Edit` / `Write` 后自动跑相关测试:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "pnpm test --related $CLAUDE_FILE" }
        ]
      }
    ]
  }
}
```

(具体匹配字段以版本为准,见 [Hooks 自动化](/advanced/hooks))

## 接下来

→ [提交与 PR](./pr-and-commit)
