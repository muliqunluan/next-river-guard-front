"use client"

import type { EventItem } from "@/lib/types/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, CheckCheck } from "lucide-react"

interface EventsTableProps {
  events: EventItem[]
  canAct: boolean
  onViewDetail: (event: EventItem) => void
  onAcknowledge: (event: EventItem) => void
  onResolve: (event: EventItem) => void
  updatingId?: number
}

const severityConfig: Record<string, { label: string; className: string }> = {
  info:    { label: "信息", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  warning: { label: "警告", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  critical: { label: "严重", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
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
    })
  } catch {
    return dateStr
  }
}

export function EventsTable({
  events,
  canAct,
  onViewDetail,
  onAcknowledge,
  onResolve,
}: EventsTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-[60px_1fr_1fr_100px_100px_160px_140px] bg-muted/50 text-sm font-medium text-muted-foreground">
        <div className="px-3 py-3">ID</div>
        <div className="px-3 py-3">摄像头</div>
        <div className="px-3 py-3">类型</div>
        <div className="px-3 py-3">严重级别</div>
        <div className="px-3 py-3">状态</div>
        <div className="px-3 py-3">发生时间</div>
        <div className="px-3 py-3">操作</div>
      </div>

      {/* 数据行 */}
      {events.map((event, idx) => (
        <div
          key={event.id}
          className={`grid grid-cols-[60px_1fr_1fr_100px_100px_160px_140px] items-center text-sm border-t hover:bg-muted/30 transition-colors ${
            idx % 2 === 0 ? "bg-background" : "bg-muted/10"
          }`}
        >
          <div className="px-3 py-3 font-mono text-xs text-muted-foreground">
            #{event.id}
          </div>
          <div className="px-3 py-3 truncate">
            Camera #{event.cameraId}
          </div>
          <div className="px-3 py-3 truncate">
            {eventTypeLabels[event.type] || event.type}
          </div>
          <div className="px-3 py-3">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityConfig[event.severity]?.className || ""}`}
            >
              {severityConfig[event.severity]?.label || event.severity}
            </span>
          </div>
          <div className="px-3 py-3">
            <Badge variant={statusConfig[event.status]?.variant || "outline"}>
              {statusConfig[event.status]?.label || event.status}
            </Badge>
          </div>
          <div className="px-3 py-3 text-xs text-muted-foreground">
            {formatTime(event.occurredAt)}
          </div>
          <div className="px-3 py-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onViewDetail(event)}
              title="查看详情"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {canAct && event.status === "pending" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onAcknowledge(event)}
                title="确认事件"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
            )}
            {canAct && event.status === "acknowledged" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onResolve(event)}
                title="解决事件"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="py-12 text-center text-muted-foreground text-sm">
          暂无事件数据
        </div>
      )}
    </div>
  )
}
