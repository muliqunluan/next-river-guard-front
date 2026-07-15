"use client"

import { useQuery } from "@tanstack/react-query"
import { Camera, Wifi, WifiOff, Loader2 } from "lucide-react"
import { fetchCameras } from "@/lib/data/cameras"
import { CamerasTable } from "./cameras-table"
import type { Camera as CameraType } from "@/lib/types/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CamerasTab() {
  const {
    data: cameras = [],
    isLoading,
    error,
  } = useQuery<CameraType[]>({
    queryKey: ["cameras"],
    queryFn: () => fetchCameras(),
    refetchInterval: 15_000, // 每 15 秒自动刷新
  })

  const onlineCount = cameras.filter((c) => c.status === "online").length
  const offlineCount = cameras.filter((c) => c.status === "offline").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-destructive">
        加载失败：{(error as Error).message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <Camera className="h-4 w-4" />
              摄像头总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cameras.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              在线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{onlineCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-muted-foreground" />
              离线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{offlineCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 摄像头列表 */}
      {cameras.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          暂无摄像头数据
        </div>
      ) : (
        <CamerasTable cameras={cameras} />
      )}
    </div>
  )
}
