---
title: 安装与登录
description: macOS / Linux / Windows 上安装 Claude Code 并完成登录
lastVerified: 2026-05 / Claude Code 2.1.148
---

# 安装与登录

## 系统要求

- **Node.js** ≥ 18(推荐 20 或 22 LTS)
- **操作系统**:macOS、Linux、Windows(Windows 推荐 WSL2)
- **网络**:能访问 `api.anthropic.com`(或自托管/代理后的 API endpoint)

::: tip 检查 Node 版本
```bash
node --version
npm --version
```
:::

## 安装

### 方式一:npm 全局安装(推荐)

```bash
npm install -g @anthropic-ai/claude-code
```

安装完成后,`claude` 命令应可全局调用:

```bash
claude --version
# 输出形如:2.1.148 (Claude Code)
```

### 方式二:原生二进制安装

Claude Code 也提供原生构建,以减少 Node 依赖:

```bash
claude install            # 安装 stable 版本
claude install latest     # 安装最新 dev/beta
claude install 2.1.148    # 指定版本
```

### 方式三:IDE 扩展

- **VS Code**:Marketplace 搜索 "Claude Code"
- **JetBrains 系列**(IntelliJ / GoLand / PyCharm 等):JetBrains Marketplace 搜索

IDE 扩展会自动复用本机已登录的 CLI 认证。

## 登录

Claude Code 支持两种认证方式:

### 1. Anthropic Console 登录(推荐普通用户)

```bash
claude
# 首次启动会提示通过浏览器完成 OAuth 登录
```

凭证会安全保存到系统 keychain。

### 2. API Key(推荐 CI / 自动化)

设置环境变量:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

或写入 `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-..."
  }
}
```

::: warning 凭证安全
- **不要**把 `ANTHROPIC_API_KEY` 提交到代码仓库
- 在共享机器上优先用 OAuth + keychain
- 在 CI 里用 GitHub Secrets / GitLab CI variables
- 团队场景见 [安全与合规](/team/security-compliance)
:::

### 3. 长效 token(订阅用户)

```bash
claude setup-token
```

适合不想每次启动都走 OAuth 的订阅用户。

### 4. 第三方/自托管 endpoint

通过环境变量指向自有代理或第三方平台:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-proxy.example.com/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your-token"
  }
}
```

或使用 Bedrock / Vertex / Foundry 第三方供应商,详见官方文档。

## 验证安装

```bash
# 进入任意项目目录
cd ~/some-project

# 启动一次会话
claude

# 看到提示符后输入(然后回车提交)
你好,请用一句话告诉我当前目录有几个文件
```

如果 Claude 调用了 `Bash` 工具并给出回复,安装就成功了。

## 常见问题

### `claude: command not found`

- 检查 `npm config get prefix` 指向的 bin 目录是否在 `PATH` 中
- 用 nvm 时:重启终端或 `nvm use <version>`
- macOS:可能需要 `~/.zshrc` 中加入 `export PATH="$(npm config get prefix)/bin:$PATH"`

### 登录后立刻退出

- 检查网络是否能访问 API endpoint:`curl -I https://api.anthropic.com`
- 公司网络可能拦截 HTTPS,需要配置代理或使用自托管 endpoint

### 自动更新

```bash
claude update
```

或在 `settings.json` 设 `"DISABLE_AUTOUPDATER": "1"` 关闭自动更新(适合需要锁版本的团队)。

## 接下来

→ [第一次会话](./first-session)
