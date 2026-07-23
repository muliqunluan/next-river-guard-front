import { type LucideIcon } from "lucide-react"

/** 单个导航菜单项的定义 */
export interface NavItem {
  /** 菜单显示文本 */
  label: string
  /** 路由路径 */
  href: string
  /** Lucide 图标组件 */
  icon: LucideIcon
  /** 所需角色（不设置则所有人可见） */
  requiredRole?: string
  /** 是否启用（默认 true，设为 false 可临时隐藏菜单项） */
  enabled?: boolean
}

/** 侧边栏导航菜单配置 */
export interface SidebarConfig {
  /** 导航菜单分组标题 */
  label: string
  /** 菜单项列表 */
  items: NavItem[]
}
