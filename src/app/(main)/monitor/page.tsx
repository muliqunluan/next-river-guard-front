'use client'

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"

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
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading")

  useEffect(() => {
    let map: any = null
    let destroyed = false

    async function initMap() {
      try {
        // 动态导入 OpenLayers
        const OlMap = (await import("ol/Map")).default
        const OlView = (await import("ol/View")).default
        const OlTileLayer = (await import("ol/layer/Tile")).default
        const OlXyzSource = (await import("ol/source/XYZ")).default
        const { defaults: defaultControls } = await import("ol/control")
        const { defaults: defaultInteractions } = await import("ol/interaction")
        const { fromLonLat } = await import("ol/proj")

        if (destroyed || !mapContainerRef.current) return

        map = new OlMap({
          target: mapContainerRef.current,
          layers: [
            new OlTileLayer({
              source: new OlXyzSource({
                url: AMAP_TILE_URL,
                crossOrigin: "anonymous",
              }),
            }),
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
      if (map) {
        map.setTarget(undefined)
        map = null
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col p-2">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">监控总览</h1>
          <p className="text-sm text-muted-foreground">内蒙古 · 察汗淖尔流域监测</p>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-border shadow-sm">
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
    </div>
  )
}
