// front/src/lib/data/roles.ts
import client from "./client";
import { Role, AssignRoleToUserParams } from "../types/types";

/**
 * 获取所有角色列表
 */
export const fetchRoles = async (): Promise<Role[]> => {
  const response = await client.get<{ data: Role[] }>('/roles');
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取角色列表失败');
};

/**
 * 通过ID获取角色
 */
export const fetchRoleById = async (id: number): Promise<Role> => {
  const response = await client.get<{ data: Role }>(`/roles/${id}`);
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取角色详情失败');
};

/**
 * 创建新角色
 */
export const createRole = async (name: string): Promise<Role> => {
  const response = await client.post<{ data: Role }>('/roles', { name });
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '创建角色失败');
};

/**
 * 更新角色
 */
export const updateRole = async (id: number, name: string): Promise<Role> => {
  const response = await client.put<{ data: Role }>(`/roles/${id}`, { name });
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '更新角色失败');
};

/**
 * 删除角色
 */
export const deleteRole = async (id: number): Promise<void> => {
  const response = await client.delete(`/roles/${id}`);
  if (!response.ok) {
    throw new Error(response.error || '删除角色失败');
  }
};

/**
 * 通过邮箱为用户分配角色
 */
export const assignRoleToUser = async (params: AssignRoleToUserParams): Promise<void> => {
  const response = await client.post('/roles/assign-to-user', params);
  if (!response.ok) {
    throw new Error(response.error || '分配角色失败');
  }
};

/**
 * 通过邮箱从用户移除角色
 */
export const removeRoleFromUser = async (email: string, roleName: string): Promise<void> => {
  const response = await client.delete(`/roles/remove-from-user?email=${encodeURIComponent(email)}&roleName=${encodeURIComponent(roleName)}`);
  if (!response.ok) {
    throw new Error(response.error || '移除角色失败');
  }
};

/**
 * 获取角色的所有权限
 */
export const fetchRolePermissions = async (roleId: number): Promise<any[]> => {
  const response = await client.get<{ data: any[] }>(`/roles/${roleId}/permissions`);
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取权限列表失败');
};

/**
 * 为角色分配权限
 */
export const assignPermissionToRole = async (roleId: number, permissionId: number): Promise<void> => {
  const response = await client.post(`/roles/${roleId}/permissions`, { permissionId });
  if (!response.ok) {
    throw new Error(response.error || '分配权限失败');
  }
};

/**
 * 从角色移除权限
 */
export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
  const response = await client.delete(`/roles/${roleId}/permissions/${permissionId}`);
  if (!response.ok) {
    throw new Error(response.error || '移除权限失败');
  }
};

/**
 * 获取拥有指定角色的所有用户
 */
export const fetchUsersWithRole = async (roleId: number): Promise<any[]> => {
  const response = await client.get<{ data: any[] }>(`/roles/${roleId}/users`);
  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取用户列表失败');
};
