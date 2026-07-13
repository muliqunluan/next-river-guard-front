// front/src/components/pages/login/login.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import useUserStore from "@/lib/stores/useUserStore"
import { LoginParams, RegisterParams } from "@/lib/types/types"
import { toast } from "sonner"

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: LoginDialogProps) {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated } = useUserStore();

  // 登录表单验证模式
  const loginSchema = z.object({
    email: z.string()
      .min(1, "请输入邮箱")
      .email("请输入有效的邮箱地址"),
    password: z.string()
      .min(1, "请输入密码")
      .min(6, "密码至少需要 6 个字符"),
  })

  // 注册表单验证模式
  const registerSchema = loginSchema.extend({
    firstName: z.string()
      .min(1, "请输入名字")
      .trim(),
    lastName: z.string()
      .optional(),
    confirmPassword: z.string()
      .min(1, "请确认密码"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })

  type LoginFormValues = z.infer<typeof loginSchema>
  type RegisterFormValues = z.infer<typeof registerSchema>
  
  // 切换登录/注册模式
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 登录表单
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 注册表单
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
    },
  })

  // 使用 useMutation 处理登录
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginParams) => {
      return await signIn(credentials);
    },
    onSuccess: () => {
      // 登录成功
      toast.success("登录成功", { id: 'login-success' });
      loginForm.reset();
      setTimeout(() => {
        onOpenChange(false);
        router.push("/user");
      }, 1500);
    },
    onError: (error: Error) => {
      // 登录失败
      toast.error(error.message || "登录失败，请重试", { id: 'login-error' });
    },
  });

  // 使用 useMutation 处理注册
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterParams) => {
      return await signUp(credentials);
    },
    onSuccess: () => {
      // 注册成功
      toast.success("注册成功", { id: 'register-success' });
      registerForm.reset();
      setTimeout(() => {
        onOpenChange(false);
        router.push("/user");
      }, 1500);
    },
    onError: (error: Error) => {
      // 注册失败
      toast.error(error.message || "注册失败，请重试", { id: 'register-error' });
    },
  });

  // 如果用户已认证，关闭对话框
  useEffect(() => {
    if (isAuthenticated && open) {
      onOpenChange(false);
      router.push("/user");
    }
  }, [isAuthenticated, open, onOpenChange, router]);

  // 记住切换前的值，供 useEffect 同步
  const prevValuesRef = useRef<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  // 切换模式（只负责切换状态，不同步值）
  const toggleMode = () => {
    prevValuesRef.current = isLoginMode
      ? {
          email: loginForm.getValues("email"),
          password: loginForm.getValues("password"),
        }
      : {
          email: registerForm.getValues("email"),
          password: registerForm.getValues("password"),
        };
    setIsLoginMode(!isLoginMode);
  };

  // 模式切换后，将上一个表单的值同步到当前表单
  useEffect(() => {
    if (isLoginMode) {
      loginForm.reset({
        email: prevValuesRef.current.email,
        password: prevValuesRef.current.password,
      });
    } else {
      registerForm.reset({
        email: prevValuesRef.current.email,
        password: prevValuesRef.current.password,
        firstName: "",
        lastName: "",
        confirmPassword: "",
      });
    }
  }, [isLoginMode]);

  // 对话框关闭时重置表单
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      loginForm.reset();
      registerForm.reset();
      // 重置 mutation 状态
      loginMutation.reset();
      registerMutation.reset();
    }
    onOpenChange(isOpen);
  };

  // 处理登录提交
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({ email: values.email, password: values.password });
  };

  // 处理注册提交
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      first_name: values.firstName,
      last_name: values.lastName || "",
    });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const currentIsLoginMode = isLoginMode;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="auth"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {currentIsLoginMode ? "登录" : "注册"}
          </DialogTitle>
        </DialogHeader>

        {currentIsLoginMode ? (
          <Form key="login-form" {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              {/* 邮箱输入 */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入您的邮箱"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 密码输入 */}
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入您的密码"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "登录中..." : "登录"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form key="register-form" {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              {/* 邮箱输入 */}
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入您的邮箱"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 名字输入 */}
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名字</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="请输入您的名字"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 姓氏输入 */}
              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓氏（可选）</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="请输入您的姓氏"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 密码输入 */}
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入您的密码"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 确认密码输入 */}
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请再次输入您的密码"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "注册中..." : "注册"}
              </Button>
            </form>
          </Form>
        )}

        {/* 切换登录/注册链接 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {currentIsLoginMode ? "还没有账号？" : "已有账号？"}{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={toggleMode}
              type="button"
            >
              {currentIsLoginMode ? "立即注册" : "立即登录"}
            </Button>
          </p>
        </div>

        <DialogFooter className="block">
          {/* 可以在这里添加其他操作按钮 */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
