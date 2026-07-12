/**
 * 认证相关的辅助函数
 */

/**
 * 从请求中获取认证 token
 */
export function getAuthTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
  
  if (!authCookie) return null;
  
  return authCookie.substring('auth_token='.length);
}

/**
 * 检查用户是否已认证
 */
export function isAuthenticated(request: Request): boolean {
  const token = getAuthTokenFromRequest(request);
  return token !== null && token.length > 0;
}