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