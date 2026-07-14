'use client'

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Loader2, Camera, Wifi, WifiOff } from "lucide-react"
import { fetchCameras } from "@/lib/data/cameras"
import type { Camera as CameraType } from "@/lib/types/types"
import { Badge } from "@/components/ui/badge"

/**
 * 高德地图公开瓦片数据源 URL（无需 API Key）
 */
const AMAP_TILE_URL =
  "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"

/**
 * 察汗淖尔中心坐标（内蒙古自治区乌兰察布市商都县与河北省张家口市尚义县交界处）
 */
const MAP_CENTER: [number, number] = [113.98, 41.30]

export default function MonitorPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const vectorSourceRef = useRef<any>(null)
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading")
  const [cameras, setCameras] = useState<CameraType[]>([])
  const [camerasLoading, setCamerasLoading] = useState(true)
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null)

  // 获取摄像头数据
  const loadCameras = useCallback(async () => {
    try {
      const data = await fetchCameras()
      setCameras(data)
    } catch {
      // 静默失败，不影响地图加载
    } finally {
      setCamerasLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCameras()
  }, [loadCameras])

  // 初始化地图
  useEffect(() => {
    let destroyed = false

    async function initMap() {
      try {
        // 动态导入 OpenLayers
        const OlMap = (await import("ol/Map")).default
        const OlView = (await import("ol/View")).default
        const OlTileLayer = (await import("ol/layer/Tile")).default
        const OlVectorLayer = (await import("ol/layer/Vector")).default
        const OlVectorSource = (await import("ol/source/Vector")).default
        const OlXyzSource = (await import("ol/source/XYZ")).default
        const { defaults: defaultControls } = await import("ol/control")
        const { defaults: defaultInteractions } = await import("ol/interaction")
        const { fromLonLat } = await import("ol/proj")

        if (destroyed || !mapContainerRef.current) return

        // 创建矢量图层（用于摄像头标记）
        const vectorSource = new OlVectorSource()
        vectorSourceRef.current = vectorSource
        const vectorLayer = new OlVectorLayer({
          source: vectorSource,
        })

        const map = new OlMap({
          target: mapContainerRef.current,
          layers: [
            new OlTileLayer({
              source: new OlXyzSource({
                url: AMAP_TILE_URL,
                crossOrigin: "anonymous",
              }),
            }),
            vectorLayer,
          ],
          view: new OlView({
            center: fromLonLat(MAP_CENTER),
            zoom: 11,
            minZoom: 3,
            maxZoom: 18,
          }),
          controls: defaultControls({
            zoom: true,
            rotate: true,
            attribution: true,
          }),
          interactions: defaultInteractions({
            mouseWheelZoom: true,
            dragPan: true,
          }),
        })

        mapRef.current = map

        // 地图点击事件 - 选中摄像头
        map.on('click', (evt: any) => {
          const feature = map.forEachFeatureAtPixel(evt.pixel, (f: any) => f)
          if (feature) {
            const cameraData = feature.get('cameraData') as CameraType
            setSelectedCamera(cameraData)
          } else {
            setSelectedCamera(null)
          }
        })

        setLoadState("loaded")
      } catch (err) {
        if (!destroyed) {
          setLoadState("error")
          console.error("地图初始化失败:", err)
        }
      }
    }

    initMap()

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
        mapRef.current = null
      }
    }
  }, [])

  // 摄像头数据加载完成后，在地图上添加标记
  useEffect(() => {
    if (loadState !== "loaded" || cameras.length === 0) return
    if (!vectorSourceRef.current) return

    async function addCameraMarkers() {
      const OlFeature = (await import("ol/Feature")).default
      const OlPoint = (await import("ol/geom/Point")).default
      const OlStyle = (await import("ol/style/Style")).default
      const OlIcon = (await import("ol/style/Icon")).default
      const { fromLonLat } = await import("ol/proj")

      const source = vectorSourceRef.current
      source.clear()

      // Camera SVG path（lucide-react Camera 图标）
      const cameraSvgPath = '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="2.5"/>'

      cameras.forEach((camera) => {
        if (camera.lat === null || camera.lng === null) return

        const isOnline = camera.status === 'online'
        const iconColor = isOnline ? '#16a34a' : '#6b7280'

        // 构建内联 SVG data URL（无背景圆底）
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cameraSvgPath}</svg>`
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

        const feature = new OlFeature({
          geometry: new OlPoint(fromLonLat([camera.lng, camera.lat])),
        })

        feature.setStyle(
          new OlStyle({
            image: new OlIcon({
              src: dataUrl,
              anchor: [0.5, 0.5],
              scale: 1.2,
            }),
          })
        )

        feature.set('cameraData', camera)
        source.addFeature(feature)
      })
    }

    addCameraMarkers()
  }, [cameras, loadState])

  // 当选中摄像头变化时，飞入到对应位置
  useEffect(() => {
    if (!selectedCamera || selectedCamera.lat === null || selectedCamera.lng === null) return
    if (!mapRef.current) return

    const lat = selectedCamera.lat
    const lng = selectedCamera.lng

    async function flyTo() {
      const { fromLonLat } = await import("ol/proj")
      const view = mapRef.current.getView()
      view.animate({
        center: fromLonLat([lng, lat]),
        zoom: 15,
        duration: 800,
      })
    }

    flyTo()
  }, [selectedCamera])

  return (
    <div className="h-full flex flex-col p-2">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">监控总览</h1>
          <p className="text-sm text-muted-foreground">内蒙古 · 察汗淖尔流域监测</p>
        </div>
        {/* 摄像头统计 */}
        {!camerasLoading && (
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span>{cameras.length} 个设备</span>
            <span className="mx-1">·</span>
            <Badge variant="secondary" className="text-xs">
              {cameras.filter(c => c.status === 'online').length} 在线
            </Badge>
            <Badge variant="outline" className="text-xs">
              {cameras.filter(c => c.status === 'offline').length} 离线
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 gap-4">
        {/* 地图容器 */}
        <div className="relative flex-1 rounded-xl overflow-hidden border border-border shadow-sm">
          {/* 加载中状态 */}
          {loadState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">地图加载中...</p>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {loadState === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <MapPin className="h-10 w-10 text-destructive" />
                <p className="text-sm text-destructive font-medium">地图加载失败</p>
                <p className="text-xs text-muted-foreground">请检查网络连接后刷新页面重试</p>
              </div>
            </div>
          )}

          {/* 地图 DOM 容器 */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* 摄像头信息面板 */}
        {selectedCamera && (
          <div className="w-72 shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              {selectedCamera.status === 'online' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-400" />
              )}
              <h3 className="font-semibold text-sm truncate" title={selectedCamera.deviceId}>
                {selectedCamera.deviceId}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>状态</span>
                <Badge variant={selectedCamera.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                  {selectedCamera.status === 'online' ? '在线' : '离线'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>纬度</span>
                <span className="font-mono text-xs">{selectedCamera.lat?.toFixed(6) ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>经度</span>
                <span className="font-mono text-xs">{selectedCamera.lng?.toFixed(6) ?? '-'}</span>
              </div>
              {selectedCamera.lastSeenAt && (
                <div className="flex justify-between">
                  <span>最后活跃</span>
                  <span className="text-xs">{new Date(selectedCamera.lastSeenAt).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
