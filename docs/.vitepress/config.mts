import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Claude Code 使用手册',
  description: '面向中文读者的 Claude Code 完整使用手册:CLI、Agent SDK 与 Claude API',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#d97706' }],
  ],

  markdown: {
    lineNumbers: true,
  },

  themeConfig: {
    outline: [2, 3],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    nav: [
      { text: '入门', link: '/getting-started/' },
      { text: '核心概念', link: '/core-concepts/' },
      { text: '工作流', link: '/workflows/' },
      { text: '进阶', link: '/advanced/' },
      { text: '团队', link: '/team/' },
      { text: '生态', link: '/ecosystem/' },
      { text: '参考', link: '/reference/' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: '入门',
          items: [
            { text: '总览', link: '/getting-started/' },
            { text: '什么是 Claude Code', link: '/getting-started/what-is-claude-code' },
            { text: '安装与登录', link: '/getting-started/install' },
            { text: '第一次会话', link: '/getting-started/first-session' },
            { text: '快捷键速查', link: '/getting-started/keyboard-shortcuts' },
            { text: '一图看懂核心概念', link: '/getting-started/concepts-glance' },
          ],
        },
      ],

      '/core-concepts/': [
        {
          text: '核心概念',
          items: [
            { text: '总览', link: '/core-concepts/' },
            { text: '工具与权限', link: '/core-concepts/tools-and-permissions' },
            { text: '斜杠命令', link: '/core-concepts/slash-commands' },
            { text: 'Skills 系统', link: '/core-concepts/skills' },
            { text: 'CLAUDE.md 项目记忆', link: '/core-concepts/claude-md' },
            { text: '跨会话自动记忆', link: '/core-concepts/auto-memory' },
            { text: '子代理 Subagents', link: '/core-concepts/subagents' },
          ],
        },
      ],

      '/workflows/': [
        {
          text: '实战工作流',
          items: [
            { text: '总览', link: '/workflows/' },
            { text: 'Bug 修复全流程', link: '/workflows/bug-fix' },
            { text: '代码审查 Code Review', link: '/workflows/code-review' },
            { text: '跨文件重构', link: '/workflows/refactor' },
            { text: '生成测试', link: '/workflows/test-generation' },
            { text: '提交与 PR', link: '/workflows/pr-and-commit' },
          ],
        },
      ],

      '/advanced/': [
        {
          text: '进阶定制',
          items: [
            { text: '总览', link: '/advanced/' },
            { text: 'settings.json 配置', link: '/advanced/settings-json' },
            { text: '权限模型', link: '/advanced/permissions' },
            { text: 'Hooks 自动化', link: '/advanced/hooks' },
            { text: '自定义 Skills', link: '/advanced/custom-skills' },
            { text: '自定义键位', link: '/advanced/keybindings' },
            { text: 'MCP 服务接入', link: '/advanced/mcp-servers' },
            { text: 'Worktree 隔离', link: '/advanced/worktrees' },
          ],
        },
      ],

      '/team/': [
        {
          text: '团队与企业',
          items: [
            { text: '总览', link: '/team/' },
            { text: '组织部署', link: '/team/org-setup' },
            { text: '团队共享配置', link: '/team/shared-config' },
            { text: 'CI 集成', link: '/team/ci-integration' },
            { text: '安全与合规', link: '/team/security-compliance' },
            { text: '成本控制', link: '/team/cost-controls' },
          ],
        },
      ],

      '/ecosystem/': [
        {
          text: '生态扩展',
          items: [
            { text: '总览', link: '/ecosystem/' },
            { text: 'Agent SDK 简介', link: '/ecosystem/agent-sdk-intro' },
            { text: 'Agent SDK 构建实战', link: '/ecosystem/agent-sdk-build' },
            { text: 'Claude API 基础', link: '/ecosystem/claude-api-basics' },
            { text: 'Prompt Caching', link: '/ecosystem/prompt-caching' },
            { text: 'Tool Use 与扩展思考', link: '/ecosystem/tool-use-and-thinking' },
            { text: '跨模型版本迁移', link: '/ecosystem/migration' },
          ],
        },
      ],

      '/reference/': [
        {
          text: '参考与附录',
          items: [
            { text: '总览', link: '/reference/' },
            { text: 'CLI 参数', link: '/reference/cli-flags' },
            { text: '斜杠命令字典', link: '/reference/slash-commands-ref' },
            { text: '工具能力矩阵', link: '/reference/tools-ref' },
            { text: 'settings 字段表', link: '/reference/settings-schema' },
            { text: 'Hook 事件结构', link: '/reference/hooks-events' },
            { text: '术语表(中英对照)', link: '/reference/glossary' },
            { text: '常见问题 FAQ', link: '/reference/faq' },
            { text: '勘误与版本', link: '/reference/changelog' },
            { text: '延伸阅读', link: '/reference/further-reading' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/claude-code' },
    ],

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    footer: {
      message: '基于 MIT 协议发布',
      copyright: 'Copyright © 2026 mickshu',
    },
  },
})
