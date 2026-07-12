// front/src/lib/data/cookies.ts
// 设置 cookie
export const setAuthCookie = (token: string) => {
  if (typeof document !== 'undefined') {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7天过期
    
    // 只在生产环境（HTTPS）使用 secure 属性
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; ${isSecure ? 'secure;' : ''} samesite=lax`;
  }
};

// 获取 cookie
export const getAuthCookie = (): string | null => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
  }
  return null;
};

// 删除 cookie
export const removeAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// 获取认证头
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = getAuthCookie();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  return headers;
};
