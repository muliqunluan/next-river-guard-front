export interface AuthResponse {
    access_token: string;
}

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    roles?: string[];
    is_protected?: boolean;
}

export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface CreateRoleParams {
    name: string;
}

export interface UpdateRoleParams {
    name: string;
}

export interface AssignPermissionParams {
    permissionId: number;
}

export interface AssignRoleToUserParams {
    email: string;
    roleName: string;
}

export interface RemoveRoleFromUserParams {
    email: string;
    roleName: string;
}

// ===== 摄像头相关类型 =====

export interface Camera {
    id: number;
    deviceId: string;
    lat: number | null;
    lng: number | null;
    status: 'online' | 'offline';
    lastSeenAt: string | null;
    createdAt: string;
}

export interface RegisterCameraResponse {
    accessToken: string;
}

export interface UpdateCameraStatusParams {
    lat: number;
    lng: number;
    status: 'online' | 'offline';
}

// ===== 事件系统类型 =====

export interface EventItem {
    id: number;
    cameraId: number;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'pending' | 'acknowledged' | 'resolved';
    description: string | null;
    metadata: Record<string, any> | null;
    occurredAt: string;
    createdAt: string;
    updatedAt: string;
    mediaFiles?: MediaFile[];
}

export interface CreateEventParams {
    type: string;
    severity: 'info' | 'warning' | 'critical';
    description?: string;
    metadata?: Record<string, any>;
    occurredAt: string;
}

export interface UpdateEventParams {
    status?: 'pending' | 'acknowledged' | 'resolved';
    severity?: 'info' | 'warning' | 'critical';
    description?: string;
}

export interface MediaFile {
    id: number;
    cameraId: number;
    eventId: number | null;
    mediaType: 'image' | 'video';
    filePath: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    capturedAt: string;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
