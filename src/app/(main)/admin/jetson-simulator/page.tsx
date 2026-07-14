'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import useUserStore from "@/lib/stores/useUserStore"
import { registerCamera, updateCameraStatus, deleteCamera, fetchCameras } from "@/lib/data/cameras"
import { startEngine, stopEngine, subscribeEngine } from "@/lib/data/simulator-engine"
import type { SimulatorStatus } from "@/lib/data/simulator-engine"
import type { Camera as CameraType } from "@/lib/types/types"
import { toast } from "sonner"
import { Cpu, Loader2, Wifi, WifiOff, Trash2, RefreshCw, Play, Square, Plus, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"

/** 检查当前用户是否拥有 admin 角色 */
function isAdmin(user: { roles?: string[] } | null): boolean {
  if (!user?.roles) return false
  return user.roles.includes("admin")
}

export default function JetsonSimulatorPage() {
  const { user, isAuthenticated, isLoading: userLoading, loadUser } = useUserStore()

  // ===== 激活指针：null = "+"（注册模式），deviceId = 控制该设备 =====
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)

  // ===== 注册表单 =====
  const [newDeviceId, setNewDeviceId] = useState("jetson-sim-001")
  const [newSharedKey, setNewSharedKey] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  // ===== 控制面板（控制当前激活的设备） =====
  const [controlLat, setControlLat] = useState("41.3023456")
  const [controlLng, setControlLng] = useState("113.9845678")
  const [controlIsOnline, setControlIsOnline] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // ===== 从引擎同步的状态（当前激活设备的自动上报状态） =====
  const [engineRunning, setEngineRunning] = useState(false)
  const [engineLat, setEngineLat] = useState("")
  const [engineLng, setEngineLng] = useState("")
  const [engineError, setEngineError] = useState<string | null>(null)
  const engineUnsubRef = useRef<(() => void) | null>(null)

  // 当 activeDeviceId 变化时，重新订阅引擎
  useEffect(() => {
    // 取消之前的订阅
    if (engineUnsubRef.current) {
      engineUnsubRef.current()
      engineUnsubRef.current = null
    }

    // 重置引擎状态
    setEngineRunning(false)
    setEngineLat("")
    setEngineLng("")
    setEngineError(null)

    if (activeDeviceId) {
      engineUnsubRef.current = subscribeEngine(activeDeviceId, (status: SimulatorStatus) => {
        setEngineRunning(status.running)
        if (status.running) {
          setEngineLat(status.lat.toFixed(7))
          setEngineLng(status.lng.toFixed(7))
        }
        setEngineError(status.error)
      })
    }

    return () => {
      if (engineUnsubRef.current) {
        engineUnsubRef.current()
        engineUnsubRef.current = null
      }
    }
  }, [activeDeviceId])

  // ===== 离线检测轮询 =====
  const [pollingOffline, setPollingOffline] = useState(false)
  const pollingOfflineRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [offlineDetected, setOfflineDetected] = useState(false)

  // ===== 摄像头列表（右侧） =====
  const [cameras, setCameras] = useState<CameraType[]>([])
  const [camerasLoading, setCamerasLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // 加载用户
  useEffect(() => {
    if (isAuthenticated && !user) loadUser()
  }, [isAuthenticated, user, loadUser])

  // 加载摄像头列表
  const loadCameras = useCallback(async () => {
    setCamerasLoading(true)
    try {
      const data = await fetchCameras()
      setCameras(data)
    } catch {
      // 静默
    } finally {
      setCamerasLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user && isAdmin(user)) {
      loadCameras()
    }
  }, [isAuthenticated, user, loadCameras])

  // ===== 根据 deviceId 获取对应摄像头的 accessToken 和 cameraId =====
  const getDeviceAuth = (deviceId: string) => {
    // 尝试从 localStorage 读取
    const token = localStorage.getItem(`jetson-token-${deviceId}`)
    const camId = localStorage.getItem(`jetson-cameraId-${deviceId}`)
    if (token && camId) {
      return { accessToken: token, cameraId: parseInt(camId, 10) }
    }
    return null
  }

  const saveDeviceAuth = (deviceId: string, accessToken: string, cameraId: number) => {
    localStorage.setItem(`jetson-token-${deviceId}`, accessToken)
    localStorage.setItem(`jetson-cameraId-${deviceId}`, cameraId.toString())
  }

  // ===== 注册新设备 =====
  const handleRegister = async () => {
    if (!newDeviceId.trim() || !newSharedKey.trim()) {
      toast.error("请填写 Device ID 和 Key")
      return
    }

    setIsRegistering(true)
    try {
      const result = await registerCamera(newDeviceId.trim(), newSharedKey.trim())

      // 刷新列表获取 camera ID
      const camerasData = await fetchCameras()
      setCameras(camerasData)
      const registered = camerasData.find((c) => c.deviceId === newDeviceId.trim())

      if (registered) {
        saveDeviceAuth(newDeviceId.trim(), result.accessToken, registered.id)
      }

      toast.success(`${newDeviceId} 注册成功`)

      // 激活指针指向新注册的设备
      setActiveDeviceId(newDeviceId.trim())

      // 清空注册表单，准备下一次注册
      setNewDeviceId(`jetson-sim-${camerasData.length + 1}`)
      setNewSharedKey("")

      // 重置控制面板坐标为默认
      setControlLat("41.3023456")
      setControlLng("113.9845678")
    } catch (err: any) {
      toast.error(err.message || "注册失败")
    } finally {
      setIsRegistering(false)
    }
  }

  // ===== 手动上报状态 =====
  const handleUpdateStatus = async () => {
    if (!activeDeviceId) return

    const auth = getDeviceAuth(activeDeviceId)
    if (!auth) {
      toast.error("该设备未注册或认证信息丢失")
      return
    }

    const latNum = parseFloat(controlLat)
    const lngNum = parseFloat(controlLng)
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error("请输入有效的经纬度")
      return
    }

    setIsUpdating(true)
    try {
      await updateCameraStatus(auth.cameraId, auth.accessToken, {
        lat: latNum,
        lng: lngNum,
        status: controlIsOnline ? 'online' : 'offline',
      })
      toast.success(`${activeDeviceId} 状态上报成功`)
      loadCameras()
    } catch (err: any) {
      toast.error(err.message || "状态上报失败")
    } finally {
      setIsUpdating(false)
    }
  }

  // ===== 自动上报切换 =====
  const toggleAutoReport = () => {
    if (!activeDeviceId) return

    const auth = getDeviceAuth(activeDeviceId)
    if (!auth) {
      toast.error("该设备未注册或认证信息丢失")
      return
    }

    if (engineRunning) {
      stopEngine(activeDeviceId)
      toast.info(`${activeDeviceId} 自动上报已停止`)

      // 检查是否所有设备都停止
      const anyRunning = cameras.some(c => {
        const a = getDeviceAuth(c.deviceId)
        return a && c.status === 'online'
      })
      if (!anyRunning) {
        startOfflinePolling()
      }
    } else {
      const latNum = parseFloat(controlLat)
      const lngNum = parseFloat(controlLng)
      if (isNaN(latNum) || isNaN(lngNum)) {
        toast.error("请输入有效的经纬度")
        return
      }

      if (pollingOfflineRef.current) {
        stopOfflinePolling()
      }
      setOfflineDetected(false)

      startEngine(activeDeviceId, {
        cameraId: auth.cameraId,
        accessToken: auth.accessToken,
        lat: latNum,
        lng: lngNum,
      })
      toast.success(`${activeDeviceId} 自动上报已启动（每10秒）`)
    }
  }

  // ===== 断连模拟 =====
  const startOfflinePolling = useCallback(() => {
    if (pollingOfflineRef.current) return
    setPollingOffline(true)
    setOfflineDetected(false)
    toast.info("所有设备已停止上报，等待后端离线检测...（约30秒）")

    pollingOfflineRef.current = setInterval(async () => {
      try {
        const data = await fetchCameras()
        setCameras(data)
        if (data.some(c => c.status === 'offline')) {
          setOfflineDetected(true)
          toast.success("后端已检测到摄像头离线！", { duration: 5000 })
          stopOfflinePolling()
        }
      } catch {
        // 静默
      }
    }, 3000)
  }, [])

  const stopOfflinePolling = useCallback(() => {
    if (pollingOfflineRef.current) {
      clearInterval(pollingOfflineRef.current)
      pollingOfflineRef.current = null
    }
    setPollingOffline(false)
  }, [])

  useEffect(() => {
    return () => {
      if (pollingOfflineRef.current) clearInterval(pollingOfflineRef.current)
    }
  }, [])

  // ===== 删除摄像头 =====
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此摄像头吗？此操作不可撤销。")) return

    setDeletingId(id)
    try {
      await deleteCamera(id)

      // 如果删除的是当前激活的设备，回到注册模式
      const deletedCam = cameras.find(c => c.id === id)
      if (deletedCam && activeDeviceId === deletedCam.deviceId) {
        setActiveDeviceId(null)
        // 清除引擎
        if (engineRunning) {
          stopEngine(deletedCam.deviceId)
        }
      }

      toast.success("摄像头已删除")
      loadCameras()
    } catch (err: any) {
      toast.error(err.message || "删除失败")
    } finally {
      setDeletingId(null)
    }
  }

  // ===== 选择设备 =====
  const selectDevice = (deviceId: string | null) => {
    setActiveDeviceId(deviceId)

    if (deviceId) {
      // 重置控制面板坐标为设备最后上报的坐标
      const cam = cameras.find(c => c.deviceId === deviceId)
      if (cam && cam.lat !== null && cam.lng !== null) {
        setControlLat(cam.lat.toFixed(7))
        setControlLng(cam.lng.toFixed(7))
      }
      setControlIsOnline(cam?.status === 'online')
    }
  }

  // ===== 权限检查 =====
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Cpu className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">请先登录后访问模拟器页面</p>
      </div>
    )
  }

  if (!isAdmin(user)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">权限不足</h2>
        <p className="text-muted-foreground">您没有管理员权限，无法访问此页面</p>
        <Badge variant="secondary" className="mt-2">
          当前角色：{user?.roles?.length ? user.roles.join(", ") : "无"}
        </Badge>
      </div>
    )
  }

  const isActive = (deviceId: string | null) => activeDeviceId === deviceId
  const activeAuth = activeDeviceId ? getDeviceAuth(activeDeviceId) : null
  const isRegistered = !!activeAuth

  return (
    <div className="space-y-6 p-2">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Cpu className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Jetson 模拟器</h1>
          <p className="text-sm text-muted-foreground">模拟 Jetson 设备与服务器通信</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {offlineDetected && (
            <Badge variant="default" className="bg-red-500">
              已检测到离线
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-[1fr_380px]">
        {/* ===== 左侧：Jetson 控制面板（注册或控制，取决于激活指针） ===== */}
        <div>
          {activeDeviceId === null ? (
            /* ===== 注册模式 ===== */
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  注册新设备
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-deviceId">DEVICE_ID（处理器序列号）</Label>
                  <Input
                    id="new-deviceId"
                    placeholder="jetson-sim-001"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-sharedKey">KEY（共享密钥）</Label>
                  <Input
                    id="new-sharedKey"
                    type="password"
                    placeholder="输入服务器 KEY"
                    value={newSharedKey}
                    onChange={(e) => setNewSharedKey(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering || !newDeviceId.trim() || !newSharedKey.trim()}
                  className="w-full"
                >
                  {isRegistering ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />注册中...</>
                  ) : (
                    <><Cpu className="h-4 w-4 mr-2" />POST /api/cameras/register</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* ===== 控制模式 ===== */
            <Card className={engineRunning ? 'border-green-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {engineRunning ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <CardTitle className="text-base">{activeDeviceId}</CardTitle>
                    <CardDescription>
                      {engineRunning ? '自动上报中' : '已注册 · 等待操作'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 坐标输入 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ctrl-lat">纬度 (lat)</Label>
                    <Input
                      id="ctrl-lat"
                      placeholder="41.3023456"
                      value={engineRunning ? engineLat : controlLat}
                      onChange={(e) => setControlLat(e.target.value)}
                      disabled={isUpdating || engineRunning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctrl-lng">经度 (lng)</Label>
                    <Input
                      id="ctrl-lng"
                      placeholder="113.9845678"
                      value={engineRunning ? engineLng : controlLng}
                      onChange={(e) => setControlLng(e.target.value)}
                      disabled={isUpdating || engineRunning}
                    />
                  </div>
                </div>

                {/* 在线/离线开关 */}
                <div className="flex items-center gap-2">
                  <Label className="cursor-pointer flex items-center gap-2">
                    <button
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        controlIsOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      onClick={() => setControlIsOnline(!controlIsOnline)}
                      disabled={engineRunning}
                      type="button"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          controlIsOnline ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-sm">{controlIsOnline ? '在线 (online)' : '离线 (offline)'}</span>
                  </Label>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || engineRunning}
                    className="flex-1"
                    variant="outline"
                  >
                    {isUpdating ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />上报中...</>
                    ) : (
                      <><Wifi className="h-4 w-4 mr-2" />手动上报</>
                    )}
                  </Button>
                  <Button
                    onClick={toggleAutoReport}
                    disabled={!isRegistered}
                    variant={engineRunning ? "destructive" : "default"}
                  >
                    {engineRunning ? (
                      <><Square className="h-4 w-4 mr-2" />停止</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" />自动</>
                    )}
                  </Button>
                </div>

                {/* 引擎状态提示 */}
                {engineRunning && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      每 10 秒自动上报，离开页面不影响运行
                    </p>
                    {engineError && (
                      <p className="text-xs text-destructive mt-1">⚠️ {engineError}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== 右侧：设备列表 ===== */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  摄像头列表
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadCameras}
                  disabled={camerasLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${camerasLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription>
                点击设备切换激活指针，或点击 <Plus className="h-3 w-3 inline" /> 注册新设备
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* 添加新设备按钮（+） */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isActive(null)
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50'
                }`}
                onClick={() => selectDevice(null)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive(null) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">注册新设备</p>
                </div>
              </div>

              <Separator className="my-1" />

              {/* 已注册设备列表 */}
              {camerasLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : cameras.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                  <p className="text-sm">暂无已注册的设备</p>
                  <p className="text-xs">点击上方 <Plus className="h-3 w-3 inline" /> 添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cameras.map((camera) => {
                    const isSelected = isActive(camera.deviceId)
                    const isRunning = camera.status === 'online'

                    return (
                      <div
                        key={camera.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-transparent bg-card hover:bg-accent/50 hover:border-border'
                        }`}
                        onClick={() => selectDevice(camera.deviceId)}
                      >
                        {isRunning ? (
                          <Wifi className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <WifiOff className="h-5 w-5 text-gray-400 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{camera.deviceId}</p>
                            <Badge variant={camera.status === 'online' ? 'default' : 'secondary'} className="text-xs shrink-0">
                              {camera.status === 'online' ? '在线' : '离线'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {camera.id}
                            {camera.lat !== null && camera.lng !== null && (
                              <> · {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}</>
                            )}
                          </p>
                          {camera.lastSeenAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(camera.lastSeenAt).toLocaleString('zh-CN')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(camera.id)
                            }}
                            disabled={deletingId === camera.id}
                          >
                            {deletingId === camera.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 断连模拟状态 */}
              {pollingOffline && !offlineDetected && (
                <p className="text-xs text-amber-600 text-center animate-pulse pt-2">
                  等待后端离线检测...（约 30 秒）
                </p>
              )}
              {offlineDetected && (
                <p className="text-xs text-red-600 text-center font-medium pt-2">
                  后端已自动将摄像头标记为离线！
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
