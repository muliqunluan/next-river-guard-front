"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ListFilter, Loader2, Image, Video } from "lucide-react"
import { fetchMediaFiles } from "@/lib/data/media"
import { MediaGrid } from "./media-grid"
import { MediaPreviewDialog } from "./media-preview-dialog"
import type { MediaFile } from "@/lib/types/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 20

export function MediaTab() {
  const [mediaType, setMediaType] = useState("")
  const [page, setPage] = useState(1)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const queryParams: Record<string, any> = { page, limit: PAGE_SIZE }
  if (mediaType) queryParams.mediaType = mediaType

  const {
    data: mediaData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["media-files", queryParams],
    queryFn: () => fetchMediaFiles(queryParams),
  })

  const handlePreview = (file: MediaFile) => {
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  const totalPages = mediaData?.totalPages ?? 0

  return (
    <div className="h-full flex flex-col">
      {/* 筛选栏 */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <ListFilter className="h-5 w-5 text-muted-foreground shrink-0" />

        <Select value={mediaType} onValueChange={(v) => { setMediaType(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="媒体类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部类型</SelectItem>
            <SelectItem value="image">
              <span className="flex items-center gap-2">
                <Image className="h-4 w-4" /> 图片
              </span>
            </SelectItem>
            <SelectItem value="video">
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4" /> 视频
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* 媒体网格 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-destructive">
            加载失败：{(error as Error).message}
          </div>
        ) : !mediaData || mediaData.items.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            暂无媒体文件
          </div>
        ) : (
          <MediaGrid files={mediaData.items} onPreview={handlePreview} />
        )}
      </div>

      {/* 分页 */}
      {mediaData && mediaData.total > 0 && (
        <div className="flex items-center justify-between mt-4 shrink-0 pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            共 {mediaData.total} 条，第 {mediaData.page}/{totalPages} 页
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      <MediaPreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
