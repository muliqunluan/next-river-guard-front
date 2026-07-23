interface Config {
    backendUrl: string
}

/**
 * 生产环境部署时通过 nginx 反向代理(如 /api/ → 后端服务)，
 * 使用相对路径 /api；本地开发时通过 NEXT_PUBLIC_BACKEND_URL 指定后端地址。
 */
const config: Config = {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
        ? `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
        : '/api',
}

export default config