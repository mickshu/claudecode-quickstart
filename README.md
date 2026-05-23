# Claude Code 使用手册

一份面向中文读者的 Claude Code 完整使用手册,覆盖 CLI、Claude Agent SDK 与 Claude API,使用 [VitePress](https://vitepress.dev/) 构建。

## 仓库定位

本仓库虽名为 `claudecode-quickstart`,实际承载的是手册文档站。所有手册内容位于 `docs/` 目录下。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器(默认 http://localhost:5173)
npm run docs:dev

# 生产构建
npm run docs:build

# 预览生产产物
npm run docs:preview
```

## 目录结构

```
docs/
├── .vitepress/        站点配置
├── index.md           首页
├── getting-started/   入门
├── core-concepts/     核心概念
├── workflows/         实战工作流
├── advanced/          进阶定制
├── team/              团队与企业
├── ecosystem/         Agent SDK + Claude API
└── reference/         参考与附录(含术语表)
```

## License

[MIT](./LICENSE)
