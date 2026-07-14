/**
 * 模拟器引擎 — 多实例工厂
 *
 * 每个 Jetson 设备对应一个独立的 Engine 实例，
 * 各自的定时器互不干扰，且脱离 React 组件生命周期运行。
 */

import { updateCameraStatus } from "./cameras"

// ===== 类型定义 =====

export interface SimulatorConfig {
  cameraId: number
  accessToken: string
  lat: number
  lng: number
}

export interface SimulatorStatus {
  running: boolean
  lat: number
  lng: number
  lastReportAt: number | null
  error: string | null
}

type StatusListener = (status: SimulatorStatus) => void

// ===== 引擎实例 =====

interface EngineInstance {
  config: SimulatorConfig | null
  timerId: ReturnType<typeof setInterval> | null
  status: SimulatorStatus
  listeners: Set<StatusListener>
}

/** 引擎实例 Map，key 为 deviceId */
const engines = new Map<string, EngineInstance>()

const INTERVAL_MS = 10000

// ===== 内部逻辑 =====

function notifyListeners(engine: EngineInstance) {
  engine.listeners.forEach((fn) => {
    try {
      fn({ ...engine.status })
    } catch {
      // 静默
    }
  })
}

async function doReport(deviceId: string) {
  const engine = engines.get(deviceId)
  if (!engine || !engine.config) return

  const { cameraId, accessToken, lat, lng } = engine.config

  // 微调坐标模拟移动
  const jitteredLat = lat + (Math.random() - 0.5) * 0.001
  const jitteredLng = lng + (Math.random() - 0.5) * 0.001

  try {
    await updateCameraStatus(cameraId, accessToken, {
      lat: jitteredLat,
      lng: jitteredLng,
      status: 'online',
    })

    // 更新 config 中的坐标
    engine.config = { ...engine.config, lat: jitteredLat, lng: jitteredLng }

    engine.status = {
      running: true,
      lat: jitteredLat,
      lng: jitteredLng,
      lastReportAt: Date.now(),
      error: null,
    }
  } catch (err: any) {
    engine.status = {
      ...engine.status,
      error: err.message || '上报失败',
    }
  }

  notifyListeners(engine)
}

// ===== 公开 API =====

/** 启动指定设备的自动上报 */
export function startEngine(deviceId: string, cfg: SimulatorConfig) {
  let engine = engines.get(deviceId)
  if (!engine) {
    engine = {
      config: null,
      timerId: null,
      status: {
        running: false,
        lat: 0,
        lng: 0,
        lastReportAt: null,
        error: null,
      },
      listeners: new Set(),
    }
    engines.set(deviceId, engine)
  }

  // 如果已有定时器，先清除
  if (engine.timerId !== null) {
    clearInterval(engine.timerId)
  }

  engine.config = { ...cfg }
  engine.status = {
    running: true,
    lat: cfg.lat,
    lng: cfg.lng,
    lastReportAt: null,
    error: null,
  }

  // 立即上报一次
  doReport(deviceId)

  // 启动定时器
  engine.timerId = setInterval(() => doReport(deviceId), INTERVAL_MS)

  notifyListeners(engine)
}

/** 停止指定设备的自动上报 */
export function stopEngine(deviceId: string) {
  const engine = engines.get(deviceId)
  if (!engine) return

  engine.config = null
  engine.status = {
    running: false,
    lat: 0,
    lng: 0,
    lastReportAt: engine.status.lastReportAt,
    error: null,
  }

  if (engine.timerId !== null) {
    clearInterval(engine.timerId)
    engine.timerId = null
  }

  notifyListeners(engine)
}

/** 停止所有设备的自动上报 */
export function stopAllEngines() {
  engines.forEach((_engine, deviceId) => {
    stopEngine(deviceId)
  })
}

/** 获取指定设备的状态快照 */
export function getEngineStatus(deviceId: string): SimulatorStatus | null {
  const engine = engines.get(deviceId)
  if (!engine) return null
  return { ...engine.status }
}

/** 获取所有正在运行的设备 ID */
export function getRunningDeviceIds(): string[] {
  const ids: string[] = []
  engines.forEach((engine, deviceId) => {
    if (engine.status.running) {
      ids.push(deviceId)
    }
  })
  return ids
}

/** 订阅指定设备的状态变化（返回取消订阅函数） */
export function subscribeEngine(deviceId: string, listener: StatusListener): () => void {
  let engine = engines.get(deviceId)
  if (!engine) {
    engine = {
      config: null,
      timerId: null,
      status: {
        running: false,
        lat: 0,
        lng: 0,
        lastReportAt: null,
        error: null,
      },
      listeners: new Set(),
    }
    engines.set(deviceId, engine)
  }

  engine.listeners.add(listener)

  // 立即推送一次当前状态
  try {
    listener({ ...engine.status })
  } catch {
    // 静默
  }

  return () => {
    engine!.listeners.delete(listener)
  }
}

/** 更新指定设备的配置 */
export function updateEngineConfig(deviceId: string, partial: Partial<SimulatorConfig>) {
  const engine = engines.get(deviceId)
  if (!engine || !engine.config) return

  engine.config = { ...engine.config, ...partial }

  if (partial.lat !== undefined || partial.lng !== undefined) {
    engine.status = {
      ...engine.status,
      lat: engine.config.lat,
      lng: engine.config.lng,
    }
    notifyListeners(engine)
  }
}
