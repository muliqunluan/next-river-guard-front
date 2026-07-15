"use client"

import type { MediaFile } from "@/lib/types/types"
import { getMediaFileUrl } from "@/lib/data/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { HardDrive, Calendar, Camera as CameraIcon } from "lucide-react"

interface MediaPreviewDialogProps {
  file: MediaFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

export function MediaPreviewDialog({ file, open, onOpenChange }: MediaPreviewDialogProps) {
  if (!file) return null

  const mediaUrl = getMediaFileUrl(file.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {file.originalName}
            <Badge variant="secondary">
              {file.mediaType === "image" ? "图片" : "视频"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* 媒体展示 */}
        <div className="bg-muted/20 rounded-xl overflow-hidden">
          {file.mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt={file.originalName}
              className="w-full max-h-[60vh] object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[60vh]"
              preload="metadata"
            >
              您的浏览器不支持视频播放
            </video>
          )}
        </div>

        {/* 文件信息 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">文件大小</span>
            <p className="font-medium flex items-center gap-1 mt-0.5">
              <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
              {formatFileSize(file.fileSize)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">摄像头</span>
            <p className="font-medium flex items-center gap-1 mt-0.5">
              <CameraIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Camera #{file.cameraId}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">拍摄时间</span>
            <p className="font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {formatTime(file.capturedAt)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">MIME 类型</span>
            <p className="font-medium mt-0.5 text-xs font-mono">{file.mimeType}</p>
          </div>
        </div>

        {file.eventId && (
          <p className="text-xs text-muted-foreground">
            关联事件 ID: #{file.eventId}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
