"use client";

import { AuthRequiredAlert } from "@/components/auth/auth-required-alert";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    User, ArrowRight, LogIn, Shield, Compass, Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useUserStore from "@/lib/stores/useUserStore";

interface LocalePageProps {
    params: Promise<{ locale: string }>;
}

export default function LocalePage({ params }: LocalePageProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('common');
    const tHome = useTranslations('home');
    const { isAuthenticated } = useUserStore();

    const handleNavigate = (link: string) => router.push(link);

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <AuthRequiredAlert />

            {/* ─── Hero Section ─── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-8 py-20 md:py-28">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm text-primary font-medium">
                            <Compass className="w-4 h-4" />
                            <span>{t('appName')}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            <span className="bg-linear-to-r from-primary via-primary/80 to-blue-600 bg-clip-text text-transparent">
                                {t('appName')}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                            {t('appDescription')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ─── */}
            <section className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{tHome('sections.protected.title')}</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            {tHome('sections.protected.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <Card
                            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            onClick={() => handleNavigate(`/${locale}/user`)}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-linear-to-br from-rose-500 to-red-500 text-white shadow-sm">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{tHome('features.user.title')}</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        {tHome('badgeLogin')}
                                    </Badge>
                                </div>
                                <CardDescription className="mt-2 leading-relaxed">
                                    {tHome('features.user.desc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all p-0 h-auto text-primary">
                                    {tHome('learnMore')}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </CardContent>
                        </Card>

                        {isAuthenticated && (
                            <Card
                                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                onClick={() => handleNavigate(`/${locale}/admin`)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{tHome('features.admin.title')}</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            Admin
                                        </Badge>
                                    </div>
                                    <CardDescription className="mt-2 leading-relaxed">
                                        {tHome('features.admin.desc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all p-0 h-auto text-primary">
                                        {tHome('learnMore')}
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!isAuthenticated && (
                            <Card
                                className="group cursor-pointer opacity-75 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                onClick={() => {/* 无需操作 */}}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{tHome('features.admin.title')}</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-muted-foreground">
                                            <LogIn className="w-3 h-3 mr-1" />
                                            {tHome('badgeLogin')}
                                        </Badge>
                                    </div>
                                    <CardDescription className="mt-2 leading-relaxed">
                                        {tHome('features.admin.desc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="gap-2 p-0 h-auto text-muted-foreground cursor-not-allowed" disabled>
                                        <Lock className="w-3 h-3" />
                                        {tHome('loginRequired')}
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
