// front/src/lib/data/client.ts
import config from "./config";
import { getAuthHeaders } from "./cookies";

// 定义请求选项接口
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

// 定义响应接口
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

async function apiClient<T = any>(
  route: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  // 构建完整的URL
  const url = `${config.backendUrl}/${route.startsWith('/') ? route.slice(1) : route}`;
  
  // 获取认证头
  const authHeaders = await getAuthHeaders();
  
  // 设置默认请求头
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...authHeaders, // 添加认证头
  };
  
  // 合并请求头
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  // 处理请求体
  const body = options.body ? JSON.stringify(options.body) : undefined;
  
  try {
    // 发送请求
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body,
      credentials: options.credentials || 'include',
    });
    
    // 尝试解析响应
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // 返回标准化的响应
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : (data?.message || data || '请求失败'),
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    // 网络错误（后端未启动、断网等）属于预期内场景，不需要在控制台打印
    return {
      error: error instanceof Error ? error.message : '网络连接失败，请检查网络设置',
      status: 0,
      ok: false,
    };
  }
}

// 导出便捷方法保持不变
const client = {
  get: <T = any>(route: string, headers?: Record<string, string>) =>
    apiClient<T>(route, { method: 'GET', headers }),
  
  post: <T = any>(route: string, body?: any, headers?: Record<string, string>) =>
    apiClient<T>(route, { method: 'POST', body, headers }),
  
  put: <T = any>(route: string, body?: any, headers?: Record<string, string>) =>
    apiClient<T>(route, { method: 'PUT', body, headers }),
  
  patch: <T = any>(route: string, body?: any, headers?: Record<string, string>) =>
    apiClient<T>(route, { method: 'PATCH', body, headers }),
  
  delete: <T = any>(route: string, headers?: Record<string, string>) =>
    apiClient<T>(route, { method: 'DELETE', headers }),
  
  request: apiClient,
};

export default client;
