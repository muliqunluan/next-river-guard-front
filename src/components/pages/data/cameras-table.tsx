"use client"

import type { Camera } from "@/lib/types/types"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

interface CamerasTableProps {
  cameras: Camera[]
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function CamerasTable({ cameras }: CamerasTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-[1fr_100px_180px_160px_160px] bg-muted/50 text-sm font-medium text-muted-foreground">
        <div className="px-4 py-3">设备 ID</div>
        <div className="px-4 py-3">状态</div>
        <div className="px-4 py-3">坐标</div>
        <div className="px-4 py-3">最后在线</div>
        <div className="px-4 py-3">注册时间</div>
      </div>

      {/* 数据行 */}
      {cameras.map((camera, idx) => (
        <div
          key={camera.id}
          className={`grid grid-cols-[1fr_100px_180px_160px_160px] items-center text-sm border-t hover:bg-muted/30 transition-colors ${
            idx % 2 === 0 ? "bg-background" : "bg-muted/10"
          }`}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{camera.deviceId}</span>
              <span className="text-[10px] text-muted-foreground">(#{camera.id})</span>
            </div>
          </div>
          <div className="px-4 py-3">
            {camera.status === "online" ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">在线</Badge>
            ) : (
              <Badge variant="secondary">离线</Badge>
            )}
          </div>
          <div className="px-4 py-3">
            {camera.lat != null && camera.lng != null ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <MapPin className="h-3 w-3 shrink-0" />
                {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
          <div className="px-4 py-3 text-xs text-muted-foreground">
            {formatTime(camera.lastSeenAt)}
          </div>
          <div className="px-4 py-3 text-xs text-muted-foreground">
            {formatTime(camera.createdAt)}
          </div>
        </div>
      ))}
    </div>
  )
}
