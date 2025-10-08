/**
 * API функции для Admin
 */

import apiClient from '../instance';
import type {
  AdminUser,
  Studio,
  AssignTeacherRequest,
  ChangeRoleRequest,
  AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
} from './types';

// Endpoints
const ADMIN_ENDPOINTS = {
  USERS: '/api/auth/admin/users',
  ASSIGN_TEACHER: '/api/auth/admin/assign-teacher',
  CHANGE_ROLE: '/api/auth/admin/change-user-role',
  ASSIGN_STUDIO: '/api/auth/admin/assign-studio',
  
  // Studios - идут через Auth Service, но НЕ через /auth prefix
  STUDIOS: '/api/studios',
  STUDIO_BY_ID: (id: number) => `/api/studios/${id}`,
  STUDIO_ACTIVATE: (id: number) => `/api/studios/${id}/activate`,
  STUDIO_DEACTIVATE: (id: number) => `/api/studios/${id}`,
  STUDIO_TEACHERS: (id: number) => `/api/studios/${id}/teachers`,
  
  // Dashboard - идет через Profile Service, но НЕ через /profile prefix  
  SYSTEM_STATS: '/api/dashboard/stats/system',
};

// ==================== USERS ====================

export const getAllUsers = async (params?: {
  limit?: number;
  offset?: number;
  role?: string;
  studio_id?: number;
}): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
};

export const assignTeacherRole = async (
  data: AssignTeacherRequest
): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.ASSIGN_TEACHER,
    data
  );
  return response.data;
};

export const changeUserRole = async (
  data: ChangeRoleRequest
): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.CHANGE_ROLE,
    data
  );
  return response.data;
};

export const assignUserToStudio = async (
  data: AssignStudioRequest
): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.ASSIGN_STUDIO,
    data
  );
  return response.data;
};

// ==================== STUDIOS ====================

export const getAllStudios = async (): Promise<Studio[]> => {
  const response = await apiClient.get<Studio[]>(ADMIN_ENDPOINTS.STUDIOS);
  return response.data;
};

export const getStudioById = async (id: number): Promise<Studio> => {
  const response = await apiClient.get<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id));
  return response.data;
};

export const createStudio = async (data: CreateStudioRequest): Promise<Studio> => {
  const response = await apiClient.post<Studio>(ADMIN_ENDPOINTS.STUDIOS, data);
  return response.data;
};

export const updateStudio = async (
  id: number,
  data: UpdateStudioRequest
): Promise<Studio> => {
  const response = await apiClient.put<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id), data);
  return response.data;
};

export const activateStudio = async (id: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.STUDIO_ACTIVATE(id)
  );
  return response.data;
};

export const deactivateStudio = async (id: number): Promise<AdminActionResponse> => {
  const response = await apiClient.delete<AdminActionResponse>(
    ADMIN_ENDPOINTS.STUDIO_DEACTIVATE(id)
  );
  return response.data;
};

export const getStudioTeachers = async (id: number): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>(ADMIN_ENDPOINTS.STUDIO_TEACHERS(id));
  return response.data;
};

// ==================== DASHBOARD ====================

/**
 * Получение системной статистики для дашборда
 */
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await apiClient.get<SystemStats>(ADMIN_ENDPOINTS.SYSTEM_STATS);
  return response.data;
};

// Экспортируем типы явно
export type {
  AdminUser,
  Studio,
  AssignTeacherRequest,
  ChangeRoleRequest,
  AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
  DashboardStats,
} from './types';