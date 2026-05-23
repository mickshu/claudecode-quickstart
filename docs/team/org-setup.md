---
title: 组织部署
description: License、计费、SSO 概览
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 组织部署

::: tip 本章是概览
具体计费、SSO、合规细节请以 [Anthropic Console](https://console.anthropic.com/) 与销售/客户成功团队对接为准。Claude Code 团队/企业版的产品形态会持续演进,本章只描述**总体形状**。
:::

## 三种用户形态

| 形态 | 谁来登录 | 计费 |
| --- | --- | --- |
| **个人 API key** | 单个开发者用自己的 Anthropic 账号 | 按 token 计 |
| **个人订阅(Pro / Max)** | 包含 Claude Code 配额 | 包月 |
| **团队 / 企业** | 组织管理员分配坐席 | 按席位 + token,常含审计 / SSO |

## 团队 / 企业版关键能力

- **集中坐席管理** —— 谁能用、用什么模型、消费上限
- **SSO / SAML** —— 通过 Okta / Azure AD / Google Workspace 等接入
- **SCIM** —— 自动入职/离职同步
- **审计日志** —— 谁在什么时间用什么模型做了什么(详细程度依等级)
- **合规** —— 数据驻留(US / EU)、HIPAA / SOC2 等

## 组织部署的三条路径

### 路径 A:Anthropic 官方托管(默认)

- API key / OAuth 都对接 `api.anthropic.com`
- 后台:`console.anthropic.com`
- 优点:零运维
- 关注点:数据出境合规需要确认

### 路径 B:云厂商托管(Bedrock / Vertex / Foundry)

```bash
# Bedrock(AWS)
export ANTHROPIC_BEDROCK_BASE_URL=...
export AWS_REGION=us-east-1
claude

# Vertex(GCP)
export ANTHROPIC_VERTEX_PROJECT_ID=...

# Foundry(Azure)
export ANTHROPIC_FOUNDRY_RESOURCE=...
```

通过云厂商通道,享其合规框架(BAA / 数据驻留 / 网络隔离)。

### 路径 C:自有代理

通过 `ANTHROPIC_BASE_URL` 指向公司内的代理网关,统一鉴权 / 限流 / 日志:

```jsonc
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://internal-llm-proxy.company.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "${SECRET_FROM_VAULT}"
  }
}
```

适合:

- 已有 LLM 网关的大型组织
- 需要统一审计 / 限流 / Prompt 防火墙的团队

## 坐席分配模式

- **按团队** —— 工程团队全员发坐席(吃成本但提效大)
- **按角色** —— 仅高级工程师 / 平台团队
- **按项目** —— 关键项目的成员才有坐席

混合也常见。Claude Code 的 ROI 通常**对老练工程师最高**(他们能问对问题、识别错误)。

## 接下来

→ [团队共享配置](./shared-config)
