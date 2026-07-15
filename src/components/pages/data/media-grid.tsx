"use client"

import type { MediaFile } from "@/lib/types/types"
import { getMediaFileUrl } from "@/lib/data/media"
import { Image, Video, FileQuestion, HardDrive } from "lucide-react"

interface MediaGridProps {
  files: MediaFile[]
  onPreview: (file: MediaFile) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function MediaGrid({ files, onPreview }: MediaGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        暂无媒体文件
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => {
        const mediaUrl = getMediaFileUrl(file.id)

        return (
          <div
            key={file.id}
            className="group relative rounded-xl border overflow-hidden cursor-pointer bg-background hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => onPreview(file)}
          >
            {/* 缩略图 */}
            <div className="aspect-square relative bg-muted/30">
              {file.mediaType === "image" ? (
                <img
                  src={mediaUrl}
                  alt={file.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : file.mediaType === "video" ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-900/5">
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  {/* 播放图标覆盖层 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                      <Video className="h-6 w-6 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* 文件信息 */}
            <div className="p-2.5 space-y-1">
              <p className="text-xs font-medium truncate" title={file.originalName}>
                {file.mediaType === "image" ? (
                  <Image className="h-3 w-3 inline mr-1 text-blue-500" />
                ) : (
                  <Video className="h-3 w-3 inline mr-1 text-purple-500" />
                )}
                {file.originalName}
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(file.fileSize)}
                </span>
                <span>Camera #{file.cameraId}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{formatTime(file.capturedAt)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
