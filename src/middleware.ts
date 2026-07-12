import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { isProtectedPath, isPublicPath } from './lib/auth/route-protection';
import { isAuthenticated } from './lib/auth/auth-helpers';

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

/**
 * 主中间件函数
 */
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. 检查是否是 API 路由或其他不需要处理的路径
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. 检查用户认证状态
  const isUserAuthenticated = isAuthenticated(request);

  // 3. 权限检查
  if (isProtectedPath(pathname)) {
    // 受保护路由：需要登录
    if (!isUserAuthenticated) {
      // 未登录，重定向到首页
      const url = new URL(`/${defaultLocale}`, request.url);
      
      // 添加重定向参数，记录用户原本想访问的页面
      url.searchParams.set('redirect', pathname);
      
      // 添加提示信息
      url.searchParams.set('auth_required', 'true');
      
      return NextResponse.redirect(url);
    }
  }

  // 4. 执行国际化中间件
  return intlMiddleware(request);
}

export const config = {
  // 匹配所有除了 api、静态资源和 favicon 的路由
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};