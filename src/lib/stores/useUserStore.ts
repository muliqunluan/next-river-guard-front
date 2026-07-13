// front/src/lib/stores/useUserStore.ts
import { retrieveUser, login, logout, register } from "../data/user";
import { User, LoginParams, RegisterParams } from "../types/types";
import { create } from "zustand";
import { getAuthCookie } from "../data/cookies";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loadUser: () => Promise<boolean>;
  signIn: (credentials: LoginParams) => Promise<boolean>;
  signUp: (credentials: RegisterParams) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  loadUser: async () => {
    // 直接检查 cookie 中是否有 token，不依赖 state（避免时序问题）
    const token = getAuthCookie();
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return false;
    }
    
    set({ isLoading: true });
    
    // 尝试用 token 从后端获取用户信息
    const user = await retrieveUser();
    
    if (!user) {
      // token 无效或后端不可达，清除登录状态
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }

    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  signIn: async (credentials: LoginParams) => {
    try {
      set({ isLoading: true });
      await login(credentials);
      // 登录成功后加载用户信息
      const user = await retrieveUser();
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      throw error; // 重新抛出错误，让调用方处理
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (credentials: RegisterParams) => {
    try {
      set({ isLoading: true });
      await register(credentials);
      // 注册成功后加载用户信息
      const user = await retrieveUser();
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      throw error; // 重新抛出错误，让调用方处理
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("退出登录失败:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// 在客户端初始化时检查认证状态
if (typeof window !== 'undefined') {
  const hasToken = !!getAuthCookie();
  useUserStore.setState({ isAuthenticated: hasToken });
}

export default useUserStore;
