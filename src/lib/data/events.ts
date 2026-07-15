// front/src/lib/data/events.ts
import client from "./client";
import { EventItem, CreateEventParams, UpdateEventParams, PaginatedResponse } from "../types/types";

/**
 * 摄像头上报事件（使用摄像头 JWT）
 * @param accessToken 摄像头 JWT
 * @param params 事件参数
 */
export const createEvent = async (
  accessToken: string,
  params: CreateEventParams,
): Promise<EventItem> => {
  const response = await client.post<{ data: EventItem }>(
    '/events',
    params,
    { Authorization: `Bearer ${accessToken}` },
  );

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '上报事件失败');
};

/**
 * 查询事件列表（使用用户 JWT）
 * @param query 查询参数
 */
export const fetchEvents = async (
  query?: {
    cameraId?: number;
    type?: string;
    severity?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
  },
): Promise<PaginatedResponse<EventItem>> => {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = `/events${queryString ? `?${queryString}` : ''}`;

  const response = await client.get<{ data: PaginatedResponse<EventItem> }>(url);

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取事件列表失败');
};

/**
 * 获取事件详情
 * @param id 事件 ID
 */
export const fetchEventById = async (id: number): Promise<EventItem> => {
  const response = await client.get<{ data: EventItem }>(`/events/${id}`);

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '获取事件详情失败');
};

/**
 * 更新事件
 * @param id 事件 ID
 * @param params 更新参数
 */
export const updateEvent = async (
  id: number,
  params: UpdateEventParams,
): Promise<EventItem> => {
  const response = await client.patch<{ data: EventItem }>(
    `/events/${id}`,
    params,
  );

  if (response.ok && response.data) {
    return response.data.data;
  }
  throw new Error(response.error || '更新事件失败');
};
