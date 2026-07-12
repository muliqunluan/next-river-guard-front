/**
 * 路由权限配置
 * 定义哪些路由需要用户登录才能访问
 */

// 不需要登录即可访问的公开路由
export const publicRoutes = [
  '/', // 首页
  '/map-square', // 地图广场
  '/test', // 测试页面
];

// 需要登录才能访问的受保护路由
export const protectedRoutes = [
  '/my-maps', // 我的地图
  '/user', // 用户信息
  '/publish-map', // 发布地图
  '/admin', // 管理员页面
];

// 登录页面路由
export const authRoutes = [];

// 检查路径是否需要权限保护
export function isProtectedPath(pathname: string): boolean {
  // 移除语言前缀（例如 /zh/my-maps -> /my-maps）
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  
  return protectedRoutes.some(route => {
    // 精确匹配
    if (pathWithoutLocale === route) return true;
    // 前缀匹配（例如 /my-maps/123 匹配 /my-maps）
    if (pathWithoutLocale.startsWith(route + '/')) return true;
    return false;
  });
}

// 检查路径是否是公开路由
export function isPublicPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  
  return publicRoutes.some(route => {
    if (pathWithoutLocale === route) return true;
    if (pathWithoutLocale.startsWith(route + '/')) return true;
    return false;
  });
}

// 检查路径是否是认证相关路由
export function isAuthPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  return authRoutes.some(route => pathWithoutLocale.startsWith(route));
}