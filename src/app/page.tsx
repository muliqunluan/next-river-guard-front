"use client";

import { useEffect, Suspense } from "react";
import { AuthRequiredAlert } from "@/components/auth/auth-required-alert";
import { useRouter } from "next/navigation";
import {
    User, ArrowRight, LogIn, Shield, Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useUserStore from "@/lib/stores/useUserStore";

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, loadUser } = useUserStore();

    // 页面加载时主动检查用户登录状态
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const handleNavigate = (link: string) => {
        router.push(link);
    };

    // 加载中显示骨架屏
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col min-h-screen p-8">
                <div className="max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-16">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <Suspense fallback={null}>
                <AuthRequiredAlert />
            </Suspense>

            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-8 py-20 md:py-28">
                    <div className="flex flex-col items-center text-center gap-6">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            <span className="bg-linear-to-r from-primary via-primary/80 to-blue-600 bg-clip-text text-transparent">
                                River Guard
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                            基于 NestJS 和 Next.js 的全栈服务平台
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ─── */}
            <section className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <Card
                            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            onClick={() => handleNavigate("/user")}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-linear-to-br from-rose-500 to-red-500 text-white shadow-sm">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">用户信息</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        登录
                                    </Badge>
                                </div>
                                <CardDescription className="mt-2 leading-relaxed">
                                    管理您的个人信息和账号设置
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all p-0 h-auto text-primary">
                                    了解更多
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </CardContent>
                        </Card>

                        {isAuthenticated && (
                            <Card
                                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                onClick={() => handleNavigate("/admin")}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">管理员面板</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            Admin
                                        </Badge>
                                    </div>
                                    <CardDescription className="mt-2 leading-relaxed">
                                        管理系统角色和用户权限分配
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all p-0 h-auto text-primary">
                                        了解更多
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!isAuthenticated && (
                            <Card
                                className="group cursor-pointer opacity-75 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                onClick={() => {}}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">管理员面板</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-muted-foreground">
                                            <LogIn className="w-3 h-3 mr-1" />
                                            登录
                                        </Badge>
                                    </div>
                                    <CardDescription className="mt-2 leading-relaxed">
                                        管理系统角色和用户权限分配
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="gap-2 p-0 h-auto text-muted-foreground cursor-not-allowed" disabled>
                                        <Lock className="w-3 h-3" />
                                        需要登录
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
