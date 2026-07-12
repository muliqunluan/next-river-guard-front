# River Guard 河流监控系统 - 前端

## 项目介绍

**River Guard（河流监控系统）** 是一个基于现代 Web 技术构建的全栈河流监控管理平台。本项目是其前端部分，采用以下技术栈：

- **框架**：[Next.js 16](https://nextjs.org)（App Router）+ [React 19](https://react.dev)
- **语言**：[TypeScript](https://www.typescriptlang.org)
- **样式方案**：[Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) 组件库
- **国际化**：[next-intl](https://next-intl.dev)（支持简体中文 / English）
- **状态管理**：[Zustand](https://zustand-demo.pmnd.rs)（客户端状态）+ [TanStack React Query](https://tanstack.com/query)（服务端状态）
- **表单处理**：[react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) 表单验证
- **HTTP 客户端**：基于 Fetch API 的自研封装

### 已实现功能

- **用户认证系统**：支持登录 / 注册功能，基于 JWT Token 的认证机制，Token 存储在 Cookie 中
- **路由权限保护**：基于 Next.js Middleware 的中间件鉴权，自动拦截未登录用户并重定向至首页
- **国际化（i18n）**：支持中文和英文双语切换，基于 `next-intl` 实现
- **侧边栏导航**：可折叠侧边栏，包含用户信息、管理员面板入口、语言切换器、登录/登出操作
- **首页展示**：Hero 区域展示项目名称与描述，功能卡片引导用户进入各个模块
- **用户信息页面**：展示当前登录用户的基本信息（姓名、邮箱）
- **管理员控制面板**：
  - 角色管理：查看所有角色、创建新角色、删除角色（admin 角色受保护不可删除）
  - 用户角色分配：通过邮箱搜索用户，以标签形式为用户分配或移除角色，受保护用户的 admin 角色不可移除
- **响应式 UI**：使用 shadcn/ui 组件库构建的现代化响应式界面

## 启动方法

### 环境要求

- [Node.js](https://nodejs.org) >= 20.x
- [Bun](https://bun.sh)（可选，项目使用 Bun 作为包管理器）

### 1. 克隆项目

```bash
git clone <repository-url>
cd next-river-guard-front
```

### 2. 安装依赖

使用 npm：

```bash
npm install
```

或使用 Bun：

```bash
bun install
```

### 3. 配置环境变量

复制环境变量示例文件并进行配置：

```bash
cp .env.local.example .env.local
```

编辑 [`.env.local`](.env.local.example:1) 文件，填写以下配置：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | 后端 API 地址（不含 `/api` 前缀） | `localhost:3001` |

> **注意**：`NEXT_PUBLIC_BACKEND_URL` 为必填项，需要指向正在运行的后端服务地址。

### 4. 启动开发服务器

```bash
npm run dev
# 或
bun dev
```

开发服务器默认在 **http://localhost:3500** 启动。

### 5. 构建生产版本

```bash
npm run build
# 或
bun run build
```

构建完成后，使用以下命令启动生产服务器：

```bash
npm run start
# 或
bun run start
```

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3500） |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器（端口 3500） |
| `npm run lint` | 运行 ESLint 代码检查 |
