// front/src/lib/data/cameras.ts
import client from "./client";
import { Camera, RegisterCameraResponse, UpdateCameraStatusParams } from "../types/types";

/**
 * 获取摄像头列表
 * @param condition 可选筛选条件（如按状态过滤）
 */
export const fetchCameras = async (condition?: string): Promise<Camera[]> => {
  const query = condition ? `?condition=${encodeURIComponent(condition)}` : '';
  const response = await client.get<{ data: Camera[] }>(`/cameras${query}`);

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取摄像头列表失败');
};

/**
 * 摄像头注册（模拟 Jetson 注册请求）
 * @param deviceId Jetson 处理器序列号
 * @param key 共享密钥
 */
export const registerCamera = async (
  deviceId: string,
  key: string,
): Promise<RegisterCameraResponse> => {
  const response = await client.post<{ data: RegisterCameraResponse }>('/cameras/register', {
    deviceId,
    key,
  });

  if (response.ok && response.data) {
    // ResponseInterceptor 将响应包装为 { success, data: { accessToken }, timestamp }
    // 需要解包取出 data 字段
    return response.data.data;
  }
  throw new Error(response.error || '摄像头注册失败');
};

/**
 * 更新摄像头状态（模拟 Jetson 状态上报）
 * @param cameraId 摄像头 ID
 * @param accessToken 摄像头 JWT
 * @param params 状态参数
 */
export const updateCameraStatus = async (
  cameraId: number,
  accessToken: string,
  params: UpdateCameraStatusParams,
): Promise<void> => {
  const response = await client.post(
    `/cameras/${cameraId}/status`,
    params,
    { Authorization: `Bearer ${accessToken}` },
  );

  if (!response.ok) {
    throw new Error(response.error || '状态上报失败');
  }
};

/**
 * 删除摄像头（测试环境）
 * @param id 摄像头 ID
 */
export const deleteCamera = async (id: number): Promise<void> => {
  const response = await client.delete(`/cameras/${id}`);
  if (!response.ok) {
    throw new Error(response.error || '删除摄像头失败');
  }
};
