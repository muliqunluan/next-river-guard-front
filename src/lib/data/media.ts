// front/src/lib/data/media.ts
import client from "./client";
import { MediaFile, PaginatedResponse } from "../types/types";

/**
 * 查询媒体文件列表
 * @param query 查询参数
 */
export const fetchMediaFiles = async (
  query?: {
    cameraId?: number;
    eventId?: number;
    mediaType?: string;
    page?: number;
    limit?: number;
  },
): Promise<PaginatedResponse<MediaFile>> => {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = `/media${queryString ? `?${queryString}` : ''}`;

  const response = await client.get<{ data: PaginatedResponse<MediaFile> }>(url);

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取媒体文件列表失败');
};

/**
 * 获取媒体文件 URL（用于 <img> 或 <video> 标签直接引用）
 * 通过 Next.js API 代理路由获取，自动携带 JWT 认证
 * @param id 媒体文件 ID
 */
export const getMediaFileUrl = (id: number): string => {
  return `/api/media/${id}/file`;
};

/**
 * 根据事件 ID 获取关联的媒体文件
 * @param eventId 事件 ID
 */
export const fetchMediaByEventId = async (eventId: number): Promise<MediaFile[]> => {
  const response = await client.get<{ data: MediaFile[] }>(
    `/media/by-event/${eventId}`,
  );

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取事件媒体文件失败');
};

/**
 * 使用 fetch 直接上传媒体文件（用于摄像头端）
 * @param accessToken 摄像头 JWT
 * @param backendUrl 后端地址
 * @param formData FormData 对象（含 file, mediaType, eventId?, capturedAt?）
 */
export const uploadMedia = async (
  accessToken: string,
  backendUrl: string,
  formData: FormData,
): Promise<MediaFile> => {
  const response = await fetch(`${backendUrl}/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // 不设置 Content-Type，让浏览器自动设置 multipart/form-data + boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '上传媒体文件失败');
  }

  const json = await response.json();
  return json.data;
};
