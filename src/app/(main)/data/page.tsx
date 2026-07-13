'use client'

import { useEffect } from "react"
import { Database, Shield, Loader2 } from "lucide-react"
import useUserStore from "@/lib/stores/useUserStore"
import { Badge } from "@/components/ui/badge"

/** 检查用户是否有 admin 角色 */
function isAdmin(user: { roles?: string[] } | null): boolean {
  if (!user?.roles) return false
  return user.roles.includes("admin")
}

export default function DataPage() {
  const { user, isAuthenticated, isLoading, loadUser } = useUserStore()

  useEffect(() => {
    if (isAuthenticated && !user) loadUser()
  }, [isAuthenticated, user, loadUser])

  // 加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // 未登录
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Database className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">请先登录后访问数据管理页面</p>
      </div>
    )
  }

  // 非管理员
  if (!isAdmin(user)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">权限不足</h2>
        <p className="text-muted-foreground">您没有管理员权限，无法访问数据管理页面</p>
        <Badge variant="secondary" className="mt-2">
          当前角色：{user?.roles?.length ? user.roles.join(", ") : "无"}
        </Badge>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-2">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">数据管理</h1>
          <p className="text-sm text-muted-foreground">数据管理与维护中心</p>
        </div>
      </div>

      {/* 空白占位区域 */}
      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-border">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Database className="h-12 w-12" />
          <p className="text-sm">数据管理功能开发中...</p>
        </div>
      </div>
    </div>
  )
}
