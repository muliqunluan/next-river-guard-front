"use client"

import { useState, useEffect } from "react"
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
import { User, LogIn, LogOut, Shield } from "lucide-react"
import { AuthDialog } from "@/components/pages/login/login"
import { Button } from "@/components/ui/button"
import useUserStore from "@/lib/stores/useUserStore"

/** 检查用户是否有 admin 角色 */
function hasAdminRole(user: { roles?: string[] } | null): boolean {
    if (!user?.roles) return false
    return user.roles.includes("admin")
}

const SidebarG = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false)

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
                        <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/user">
                                        <User />
                                        <span>用户</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {hasAdminRole(user) && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/admin">
                                            <Shield />
                                            <span>管理员</span>
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
