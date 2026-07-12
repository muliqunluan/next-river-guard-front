"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from 'next-intl';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { User, LogIn, LogOut, Shield } from "lucide-react"
import { AuthDialog } from "@/components/pages/login/login"
import { Button } from "@/components/ui/button"
import useUserStore from "@/lib/stores/useUserStore"
import LanguageSwitcher from "@/components/layout/language-switcher/language-switcher"

/** 检查用户是否有 admin 角色 */
function hasAdminRole(user: { roles?: string[] } | null): boolean {
    if (!user?.roles) return false
    return user.roles.includes("admin")
}

const SidebarG = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const locale = useLocale()
    const t = useTranslations('sidebar')

    const { isAuthenticated, isLoading, loadUser, signOut, user } = useUserStore()

    // 在组件挂载时验证用户状态
    useEffect(() => {
        if (isAuthenticated && !user) {
            loadUser()
        }
    }, [isAuthenticated, loadUser, user])

    // 在组件挂载时验证用户状态
    useEffect(() => {
        if (isAuthenticated && !user) {
            loadUser()
        }
    }, [isAuthenticated, loadUser, user])

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarRail >
                    
                </SidebarRail>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2">
                        <SidebarGroupLabel>{t('title')}</SidebarGroupLabel>
                        <LanguageSwitcher />
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/${locale}/user`}>
                                        <User />
                                        <span>{t('user')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {hasAdminRole(user) && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/${locale}/admin`}>
                                            <Shield />
                                            <span>{t('admin')}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            <SidebarMenuItem>
                                {isAuthenticated ? (
                                    <SidebarMenuButton asChild>
                                        <Button
                                            variant="ghost"
                                            onClick={signOut}
                                            className="w-full justify-start"
                                            disabled={isLoading}
                                        >
                                            <LogOut />
                                            <span>{t('logout')}</span>
                                        </Button>
                                    </SidebarMenuButton>
                                ) : (
                                    <SidebarMenuButton asChild>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsLoginOpen(true)}
                                            className="w-full justify-start"
                                            disabled={isLoading}
                                        >
                                            <LogIn />
                                            <span>{t('login')}</span>
                                        </Button>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <AuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
        </Sidebar>
    )
}

export default SidebarG