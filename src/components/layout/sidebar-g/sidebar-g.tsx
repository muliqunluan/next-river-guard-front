"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
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
import { LogIn, LogOut } from "lucide-react"
import { AuthDialog } from "@/components/pages/login/login"
import { Button } from "@/components/ui/button"
import useUserStore from "@/lib/stores/useUserStore"
import { defaultSidebarConfig } from "./sidebar.config"
import type { SidebarConfig } from "./sidebar.types"

interface SidebarGProps {
  /** 可选配置覆盖。提供 items 将完全替换默认菜单；提供 label 将覆盖标题 */
  config?: Partial<SidebarConfig>
}

/** 检查用户是否有 admin 角色 */
function hasAdminRole(user: { roles?: string[] } | null): boolean {
    if (!user?.roles) return false
    return user.roles.includes("admin")
}

const SidebarG = ({ config: configOverride }: SidebarGProps) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false)

    const { isAuthenticated, isLoading, loadUser, signOut, user } = useUserStore()

    // 合并默认配置与外部覆盖
    const mergedConfig = useMemo<SidebarConfig>(() => ({
        ...defaultSidebarConfig,
        ...configOverride,
        items: configOverride?.items ?? defaultSidebarConfig.items,
    }), [configOverride])

    // 在组件挂载时验证用户状态
    useEffect(() => {
        if (isAuthenticated && !user) {
            loadUser()
        }
    }, [isAuthenticated, loadUser, user])

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarRail />

                <SidebarGroup>
                    <div className="flex items-center justify-between px-2">
                        <SidebarGroupLabel>{mergedConfig.label}</SidebarGroupLabel>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mergedConfig.items
                                .filter(item => item.enabled !== false)
                                .filter(item => !item.requiredRole || hasAdminRole(user))
                                .map(item => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}

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
                                            <span>登出</span>
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
                                            <span>登录</span>
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
