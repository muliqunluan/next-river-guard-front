// front/src/lib/auth/permissions.ts
import type { User } from "../types/types";

/** 访问管理面板所需的管理权限（拥有任意一个即可） */
export const ADMIN_PERMISSIONS = [
  "manage-users",
  "manage-roles",
  "manage-permissions",
] as const;

/**
 * 判断用户是否有权访问管理面板。
 * 规则：拥有任一管理权限（manage-users / manage-roles / manage-permissions）
 * 或拥有 admin 角色（兼容旧逻辑）即可访问。
 */
export function canAccessAdmin(
  user: Pick<User, "roles" | "permissions"> | null
): boolean {
  if (!user) return false;

  // 兼容：admin 角色始终可访问
  if (user.roles?.includes("admin")) return true;

  // 权限检查：拥有任一管理权限即可
  return (user.permissions ?? []).some((p) =>
    (ADMIN_PERMISSIONS as readonly string[]).includes(p)
  );
}
