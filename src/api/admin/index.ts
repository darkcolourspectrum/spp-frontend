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
} from './types';

// Endpoints
const ADMIN_ENDPOINTS = {
  USERS: '/api/auth/admin/users',
  ASSIGN_TEACHER: '/api/auth/admin/assign-teacher',
  CHANGE_ROLE: '/api/auth/admin/change-user-role',
  ASSIGN_STUDIO: '/api/auth/admin/assign-studio',
  
  STUDIOS: '/api/auth/studios',
  STUDIO_BY_ID: (id: number) => `/api/auth/studios/${id}`,
  STUDIO_ACTIVATE: (id: number) => `/api/auth/studios/${id}/activate`,
  STUDIO_DEACTIVATE: (id: number) => `/api/auth/studios/${id}`,
  STUDIO_TEACHERS: (id: number) => `/api/auth/studios/${id}/teachers`,
};

// ==================== USERS ====================

/**
 * Получение списка всех пользователей
 */
export const getAllUsers = async (params?: {
  limit?: number;
  offset?: number;
  role?: string;
  studio_id?: number;
}): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
};

/**
 * Назначение роли преподавателя
 */
export const assignTeacherRole = async (
  data: AssignTeacherRequest
): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.ASSIGN_TEACHER,
    data
  );
  return response.data;
};

/**
 * Изменение роли пользователя
 */
export const changeUserRole = async (
  data: ChangeRoleRequest
): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.CHANGE_ROLE,
    data
  );
  return response.data;
};

/**
 * Привязка пользователя к студии
 */
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

/**
 * Получение списка студий
 */
export const getAllStudios = async (): Promise<Studio[]> => {
  const response = await apiClient.get<Studio[]>(ADMIN_ENDPOINTS.STUDIOS);
  return response.data;
};

/**
 * Получение студии по ID
 */
export const getStudioById = async (id: number): Promise<Studio> => {
  const response = await apiClient.get<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id));
  return response.data;
};

/**
 * Создание новой студии
 */
export const createStudio = async (data: CreateStudioRequest): Promise<Studio> => {
  const response = await apiClient.post<Studio>(ADMIN_ENDPOINTS.STUDIOS, data);
  return response.data;
};

/**
 * Обновление студии
 */
export const updateStudio = async (
  id: number,
  data: UpdateStudioRequest
): Promise<Studio> => {
  const response = await apiClient.put<Studio>(ADMIN_ENDPOINTS.STUDIO_BY_ID(id), data);
  return response.data;
};

/**
 * Активация студии
 */
export const activateStudio = async (id: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.STUDIO_ACTIVATE(id)
  );
  return response.data;
};

/**
 * Деактивация студии
 */
export const deactivateStudio = async (id: number): Promise<AdminActionResponse> => {
  const response = await apiClient.delete<AdminActionResponse>(
    ADMIN_ENDPOINTS.STUDIO_DEACTIVATE(id)
  );
  return response.data;
};

/**
 * Получение преподавателей студии
 */
export const getStudioTeachers = async (id: number): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>(ADMIN_ENDPOINTS.STUDIO_TEACHERS(id));
  return response.data;
};