"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ListFilter, Loader2 } from "lucide-react"
import { fetchEvents, updateEvent } from "@/lib/data/events"
import { fetchCameras } from "@/lib/data/cameras"
import { EventsTable } from "./events-table"
import { EventDetailDialog } from "./event-detail-dialog"
import type { EventItem, Camera } from "@/lib/types/types"
import useUserStore from "@/lib/stores/useUserStore"
import { canHandleEvents } from "./data-page-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "garbage_detected", label: "垃圾检测" },
  { value: "video_triggered", label: "视频触发" },
  { value: "system_alert", label: "系统告警" },
]

const SEVERITY_OPTIONS = [
  { value: "", label: "全部级别" },
  { value: "info", label: "信息" },
  { value: "warning", label: "警告" },
  { value: "critical", label: "严重" },
]

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待处理" },
  { value: "acknowledged", label: "已确认" },
  { value: "resolved", label: "已解决" },
]

const PAGE_SIZE = 15

export function EventsTab() {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const canAct = canHandleEvents(user)

  // 筛选条件
  const [cameraId, setCameraId] = useState("")
  const [eventType, setEventType] = useState("")
  const [severity, setSeverity] = useState("")
  const [status, setStatus] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [page, setPage] = useState(1)

  // 详情弹窗
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 加载摄像头列表（用于筛选下拉）
  const { data: cameras = [] } = useQuery<Camera[]>({
    queryKey: ["cameras"],
    queryFn: () => fetchCameras(),
    staleTime: 30_000,
  })

  // 加载事件列表
  const queryParams: Record<string, any> = { page, limit: PAGE_SIZE }
  if (cameraId) queryParams.cameraId = Number(cameraId)
  if (eventType) queryParams.type = eventType
  if (severity) queryParams.severity = severity
  if (status) queryParams.status = status
  if (startTime) queryParams.startTime = new Date(startTime).toISOString()
  if (endTime) queryParams.endTime = new Date(endTime).toISOString()

  const {
    data: eventsData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["events", queryParams],
    queryFn: () => fetchEvents(queryParams),
  })

  // 更新事件 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: number; params: Record<string, any> }) =>
      updateEvent(id, params as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
    onError: (err: Error) => toast.error(err.message || "操作失败"),
  })

  const handleAcknowledge = useCallback(
    (event: EventItem) => {
      updateMutation.mutate({ id: event.id, params: { status: "acknowledged" } })
    },
    [updateMutation],
  )

  const handleResolve = useCallback(
    (event: EventItem) => {
      updateMutation.mutate({ id: event.id, params: { status: "resolved" } })
    },
    [updateMutation],
  )

  const handleViewDetail = useCallback((event: EventItem) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }, [])

  const totalPages = eventsData?.totalPages ?? 0

  return (
    <div className="h-full flex flex-col">
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        <ListFilter className="h-5 w-5 text-muted-foreground shrink-0" />

        <Select value={cameraId} onValueChange={(v) => { setCameraId(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="选择摄像头" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部摄像头</SelectItem>
            {cameras.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.deviceId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={eventType} onValueChange={(v) => { setEventType(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="事件类型" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1) }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="严重级别" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="处理状态" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="datetime-local"
          className="w-[180px]"
          value={startTime}
          onChange={(e) => { setStartTime(e.target.value); setPage(1) }}
          placeholder="开始时间"
        />
        <span className="text-muted-foreground text-sm">~</span>
        <Input
          type="datetime-local"
          className="w-[180px]"
          value={endTime}
          onChange={(e) => { setEndTime(e.target.value); setPage(1) }}
          placeholder="结束时间"
        />

        {(cameraId || eventType || severity || status || startTime || endTime) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCameraId("")
              setEventType("")
              setSeverity("")
              setStatus("")
              setStartTime("")
              setEndTime("")
              setPage(1)
            }}
          >
            清除筛选
          </Button>
        )}

        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* 事件列表 */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-destructive">
            加载失败：{(error as Error).message}
          </div>
        ) : !eventsData || eventsData.items.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            暂无事件数据
          </div>
        ) : (
          <EventsTable
            events={eventsData.items}
            canAct={canAct}
            onViewDetail={handleViewDetail}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            updatingId={updateMutation.isPending ? undefined : undefined}
          />
        )}
      </div>

      {/* 分页 */}
      {eventsData && eventsData.total > 0 && (
        <div className="flex items-center justify-between mt-4 shrink-0 pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            共 {eventsData.total} 条，第 {eventsData.page}/{totalPages} 页
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

      {/* 详情弹窗 */}
      <EventDetailDialog
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
