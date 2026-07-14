// front/src/lib/data/user.ts
import client from "./client";
import { User, LoginParams, AuthResponse, RegisterParams } from "../types/types";
import { setAuthCookie, getAuthCookie } from "./cookies";
import { removeAuthCookie } from "./cookies";

export const retrieveUser = async (): Promise<User | null> => {
  try {
    const response = await client.get('/auth/me');
    
    if (response.ok && response.data) {
      return response.data.data;
    } else {
      // 如果请求失败，可能是 token 过期或无效
      return null;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

export const login = async (formdata: LoginParams) => {
  try {
    const response = await client.post<AuthResponse>('/auth/login', formdata);
    
    if (!response.ok) {
      // 根据状态码区分错误类型
      if (response.status === 0) {
        // 网络错误（后端未启动、断网等）
        throw new Error(response.error || '网络连接失败，请检查后端服务是否已启动');
      }
      if (response.status === 401) {
        throw new Error('邮箱或密码错误');
      }
      // 其他服务器错误
      throw new Error(response.error || '登录失败，请稍后重试');
    }
    
    // 处理嵌套的响应结构
    const responseData = response.data as any;
    const accessToken = responseData?.data?.access_token || responseData?.access_token;
    
    if (accessToken) {
      // 保存 token 到 cookie
      setAuthCookie(accessToken);
      return responseData.data || responseData;
    } else {
      throw new Error('登录响应异常，未获取到访问令牌');
    }
  } catch (error) {
    console.error('登录请求异常：', error);
    // 确保所有错误都被正确抛出
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('登录失败，请稍后重试');
    }
  }
};

// 注册函数
export const register = async (formdata: RegisterParams) => {
  try {
    const response = await client.post<AuthResponse>('/auth/register', formdata);
    
    // 处理嵌套的响应结构
    const responseData = response.data as any;
    const accessToken = responseData?.data?.access_token || responseData?.access_token;
    
    if (response.ok && accessToken) {
      // 保存 token 到 cookie
      setAuthCookie(accessToken);
      console.log('注册成功，token 已保存');
      
      return responseData.data || responseData;
    } else {
      console.error('注册失败', response.error);
      throw new Error(response.error || '注册失败，请检查输入信息');
    }
  } catch (error) {
    console.error('注册请求异常：', error);
    // 确保网络错误也能显示友好的错误信息
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('网络连接失败，请检查网络设置');
    }
  }
};

/**
 * 通过邮箱直接搜索用户（独立于角色，用于查找无角色用户）
 * 调用后端 GET /users/email/:email 端点
 */
export const searchUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await client.get<{ data: User }>(`/users/email/${encodeURIComponent(email)}`);
    if (response.ok && response.data) {
      return response.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

// 登出函数
export const logout = async () => {
  removeAuthCookie();
};
