import { User, MapPin, Database, Shield, Cpu, Blocks } from "lucide-react"
import type { SidebarConfig } from "./sidebar.types"

/**
 * 默认侧边栏导航菜单配置。
 *
 * 如需自定义菜单，可在此文件中修改配置，
 * 或在组件使用时通过 config prop 覆盖：
 *
 * @example
 * ```tsx
 * // 覆盖全部菜单
 * <SidebarG config={{ items: [...] }} />
 *
 * // 仅覆盖标题
 * <SidebarG config={{ label: "主菜单" }} />
 * ```
 */
export const defaultSidebarConfig: SidebarConfig = {
  label: "导航菜单",
  items: [
    { label: "监控总览",       href: "/monitor",              icon: MapPin },
    { label: "3D 驾驶舱", href: "/three", icon: Blocks},
    { label: "数据管理",       href: "/data",                 icon: Database, requiredRole: "admin" },
    { label: "管理员",         href: "/admin",                icon: Shield,   requiredRole: "admin" },
    { label: "Jetson 模拟器", href: "/admin/jetson-simulator", icon: Cpu,    requiredRole: "admin" },
    { label: "用户",           href: "/user",                 icon: User },
  ],
}
