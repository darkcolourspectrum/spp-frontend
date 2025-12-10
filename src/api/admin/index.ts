/**
 * API функции для Admin Service
 */

import apiClient from '../instance';
import type {
  AdminUser,
  Studio,
  // UpdateRoleRequest,
  // AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
} from './types';

// Endpoints - всё через Admin Service
const ADMIN_ENDPOINTS = {
  // User Management
  USERS: '/api/admin/user-management',
  UPDATE_ROLE: (userId: number) => `/api/admin/user-management/${userId}/role`,
  ASSIGN_STUDIO: (userId: number) => `/api/admin/user-management/${userId}/studio`,
  ACTIVATE_USER: (userId: number) => `/api/admin/user-management/${userId}/activate`,
  DEACTIVATE_USER: (userId: number) => `/api/admin/user-management/${userId}/deactivate`,
  
  // Studios
  STUDIOS: '/api/admin/studios',
  STUDIO_BY_ID: (id: number) => `/api/admin/studios/${id}`,
  
  // Dashboard
  DASHBOARD: '/api/admin/dashboard',
  SYSTEM_STATS: '/api/admin/dashboard/system-stats',
};

// ==================== USERS ====================

/**
 * Получить всех пользователей с фильтрами
 */
export const getAllUsers = async (params?: {
  limit?: number;
  offset?: number;
  role?: string;
  studio_id?: number;
  is_active?: boolean;
}): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
};

/**
 * Изменить роль пользователя
 */
export const updateUserRole = async (
  userId: number,
  role: string
): Promise<AdminActionResponse> => {
  const response = await apiClient.put<AdminActionResponse>(
    ADMIN_ENDPOINTS.UPDATE_ROLE(userId),
    { role }
  );
  return response.data;
};

/**
 * Привязать пользователя к студии
 */
export const assignUserToStudio = async (
  userId: number,
  studioId: number
): Promise<AdminActionResponse> => {
  const response = await apiClient.put<AdminActionResponse>(
    ADMIN_ENDPOINTS.ASSIGN_STUDIO(userId),
    { studio_id: studioId }
  );
  return response.data;
};

/**
 * Активировать пользователя
 */
export const activateUser = async (userId: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.ACTIVATE_USER(userId)
  );
  return response.data;
};

/**
 * Деактивировать пользователя
 */
export const deactivateUser = async (userId: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.DEACTIVATE_USER(userId)
  );
  return response.data;
};

// ==================== STUDIOS ====================

/**
 * Получить все студии
 */
export const getAllStudios = async (): Promise<Studio[]> => {
  const response = await apiClient.get<Studio[]>(ADMIN_ENDPOINTS.STUDIOS);
  return response.data;
};

/**
 * Получить студию по ID
 */
export const getStudioById = async (id: number): Promise<Studio> => {
  const response = await apiClient.get<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id));
  return response.data;
};

/**
 * Создать новую студию
 */
export const createStudio = async (data: CreateStudioRequest): Promise<Studio> => {
  const response = await apiClient.post<Studio>(ADMIN_ENDPOINTS.STUDIOS, data);
  return response.data;
};

/**
 * Обновить студию
 */
export const updateStudio = async (
  id: number,
  data: UpdateStudioRequest
): Promise<Studio> => {
  const response = await apiClient.put<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id), data);
  return response.data;
};

/**
 * Удалить студию
 */
export const deleteStudio = async (id: number): Promise<void> => {
  await apiClient.delete(ADMIN_ENDPOINTS.STUDIO_BY_ID(id));
};

// ==================== DASHBOARD ====================

/**
 * Получить системную статистику для дашборда
 */
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await apiClient.get<SystemStats>(ADMIN_ENDPOINTS.SYSTEM_STATS);
  return response.data;
};

/**
 * Получить полный дашборд администратора
 */
export const getAdminDashboard = async (): Promise<any> => {
  const response = await apiClient.get(ADMIN_ENDPOINTS.DASHBOARD);
  return response.data;
};

// Экспортируем типы
export type {
  AdminUser,
  Studio,
  UpdateRoleRequest,
  AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
} from './types';