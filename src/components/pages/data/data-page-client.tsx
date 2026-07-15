"use client"

import { useEffect } from "react"
import { Database, Shield, Loader2, AlertTriangle, Image, Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import useUserStore from "@/lib/stores/useUserStore"
import { EventsTab } from "./events-tab"
import { MediaTab } from "./media-tab"
import { CamerasTab } from "./cameras-tab"

/** 角色工具函数 */
export function hasRole(user: { roles?: string[] } | null, role: string): boolean {
  if (!user?.roles) return false
  return user.roles.includes(role)
}

export function isAdmin(user: { roles?: string[] } | null): boolean {
  return hasRole(user, "admin")
}

export function isEditor(user: { roles?: string[] } | null): boolean {
  return hasRole(user, "editor")
}

/** 是否可以处理事件（确认/解决） */
export function canHandleEvents(user: { roles?: string[] } | null): boolean {
  return isAdmin(user) || isEditor(user)
}

export function DataPageClient() {
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

  // viewer/editor/admin 之外的未知角色
  const canAccess = user?.roles?.some(r => ["admin", "editor", "viewer"].includes(r))
  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">权限不足</h2>
        <p className="text-muted-foreground">您没有访问数据管理页面的权限</p>
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

      <Tabs defaultValue="events" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 shrink-0">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            事件管理
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            媒体文件
          </TabsTrigger>
          <TabsTrigger value="cameras" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            摄像头概览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="flex-1 min-h-0">
          <EventsTab />
        </TabsContent>

        <TabsContent value="media" className="flex-1 min-h-0">
          <MediaTab />
        </TabsContent>

        <TabsContent value="cameras" className="flex-1 min-h-0">
          <CamerasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
