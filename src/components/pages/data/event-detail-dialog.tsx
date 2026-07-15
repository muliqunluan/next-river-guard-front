"use client"

import { useQuery } from "@tanstack/react-query"
import type { EventItem, MediaFile } from "@/lib/types/types"
import { fetchMediaByEventId, getMediaFileUrl } from "@/lib/data/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Image, Video, FileQuestion } from "lucide-react"

interface EventDetailDialogProps {
  event: EventItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const severityLabels: Record<string, { label: string; className: string }> = {
  info:    { label: "信息", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  warning: { label: "警告", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  critical: { label: "严重", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending:       { label: "待处理", variant: "outline" },
  acknowledged:  { label: "已确认", variant: "secondary" },
  resolved:      { label: "已解决", variant: "default" },
}

const eventTypeLabels: Record<string, string> = {
  garbage_detected: "垃圾检测",
  video_triggered: "视频触发",
  system_alert: "系统告警",
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function MediaPreview({ media }: { media: MediaFile }) {
  const mediaUrl = getMediaFileUrl(media.id)

  if (media.mediaType === "image") {
    return (
      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative rounded-lg overflow-hidden border group cursor-pointer">
          <img
            src={mediaUrl}
            alt={media.originalName}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            <Image className="h-3 w-3" />
            {media.originalName}
          </div>
        </div>
      </a>
    )
  }

  if (media.mediaType === "video") {
    return (
      <div className="relative rounded-lg overflow-hidden border">
        <video
          src={mediaUrl}
          controls
          className="w-full h-48 object-cover"
          preload="metadata"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          <Video className="h-3 w-3" />
          {media.originalName}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm p-3 border rounded-lg">
      <FileQuestion className="h-4 w-4" />
      未知媒体类型
    </div>
  )
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  const { data: mediaFiles, isLoading: mediaLoading } = useQuery<MediaFile[]>({
    queryKey: ["media-by-event", event?.id],
    queryFn: () => fetchMediaByEventId(event!.id),
    enabled: open && !!event,
  })

  if (!event) return null

  const severity = severityLabels[event.severity] || { label: event.severity, className: "" }
  const status = statusLabels[event.status] || { label: event.status, variant: "outline" as const }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            事件详情 #{event.id}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severity.className}`}
            >
              {severity.label}
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            事件基本信息与关联媒体文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">事件类型</span>
              <p className="font-medium">{eventTypeLabels[event.type] || event.type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">摄像头 ID</span>
              <p className="font-medium">Camera #{event.cameraId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">发生时间</span>
              <p className="font-medium">{formatTime(event.occurredAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">记录时间</span>
              <p className="font-medium">{formatTime(event.createdAt)}</p>
            </div>
          </div>

          {/* 描述 */}
          {event.description && (
            <div>
              <span className="text-sm text-muted-foreground">描述</span>
              <p className="text-sm mt-1 p-3 bg-muted/30 rounded-lg whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* 元数据 */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">元数据</span>
              <pre className="text-xs mt-1 p-3 bg-muted/30 rounded-lg overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          <Separator />

          {/* 关联媒体文件 */}
          <div>
            <span className="text-sm text-muted-foreground">关联媒体文件</span>
            {mediaLoading ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载中...
              </div>
            ) : mediaFiles && mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {mediaFiles.map((media) => (
                  <MediaPreview key={media.id} media={media} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">暂无关联媒体文件</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
