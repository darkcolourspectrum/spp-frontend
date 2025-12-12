/**
 * API функции для Admin Service
 */

import apiClient from '../instance';
import type {
  AdminUser,
  Studio,
  Classroom,
  ClassroomCreate,
  ClassroomUpdate,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
} from './types';

// Endpoints
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
  
  // Classrooms
  STUDIO_CLASSROOMS: (studioId: number) => `/api/admin/studios/${studioId}/classrooms`,
  CLASSROOM_BY_ID: (id: number) => `/api/admin/classrooms/${id}`,
  
  // Dashboard
  DASHBOARD: '/api/admin/dashboard',
  SYSTEM_STATS: '/api/admin/dashboard/system-stats',
};

// ==================== USERS ====================

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

export const activateUser = async (userId: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.ACTIVATE_USER(userId)
  );
  return response.data;
};

export const deactivateUser = async (userId: number): Promise<AdminActionResponse> => {
  const response = await apiClient.post<AdminActionResponse>(
    ADMIN_ENDPOINTS.DEACTIVATE_USER(userId)
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

export const deleteStudio = async (id: number): Promise<void> => {
  await apiClient.delete(ADMIN_ENDPOINTS.STUDIO_BY_ID(id));
};

// ==================== CLASSROOMS ====================

export const getStudioClassrooms = async (studioId: number): Promise<Classroom[]> => {
  const response = await apiClient.get<Classroom[]>(
    ADMIN_ENDPOINTS.STUDIO_CLASSROOMS(studioId)
  );
  return response.data;
};

export const createClassroom = async (
  studioId: number,
  data: ClassroomCreate
): Promise<Classroom> => {
  const response = await apiClient.post<Classroom>(
    ADMIN_ENDPOINTS.STUDIO_CLASSROOMS(studioId),
    data
  );
  return response.data;
};

export const updateClassroom = async (
  classroomId: number,
  data: ClassroomUpdate
): Promise<Classroom> => {
  const response = await apiClient.put<Classroom>(
    ADMIN_ENDPOINTS.CLASSROOM_BY_ID(classroomId),
    data
  );
  return response.data;
};

export const deleteClassroom = async (classroomId: number): Promise<void> => {
  await apiClient.delete(ADMIN_ENDPOINTS.CLASSROOM_BY_ID(classroomId));
};

// ==================== DASHBOARD ====================

export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await apiClient.get<SystemStats>(ADMIN_ENDPOINTS.SYSTEM_STATS);
  return response.data;
};

export const getAdminDashboard = async (): Promise<any> => {
  const response = await apiClient.get(ADMIN_ENDPOINTS.DASHBOARD);
  return response.data;
};

// Экспортируем типы
export type {
  AdminUser,
  Studio,
  Classroom,
  ClassroomCreate,
  ClassroomUpdate,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
  SystemStats,
} from './types';