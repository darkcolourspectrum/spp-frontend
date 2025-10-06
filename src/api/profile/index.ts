/**
 * API функции для Profile Service
 */

import apiClient from '../instance';
import { PROFILE_ENDPOINTS } from '../endpoints';
import type {
  UserProfile,
  ProfileUpdateRequest,
  AvatarUploadResponse,
  AvatarDeleteResponse,
  DashboardData,
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  RecentActivity,
  ActivityFilter,
  ActivityListResponse,
} from './types';

// ==================== PROFILE OPERATIONS ====================

/**
 * Получение своего профиля
 * Использует user_id из токена
 */
export const getMyProfile = async (userId: number): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(PROFILE_ENDPOINTS.PROFILE_BY_ID(userId));
  return response.data;
};

/**
 * Получение профиля по user_id
 */
export const getProfileById = async (userId: number): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(PROFILE_ENDPOINTS.PROFILE_BY_ID(userId));
  return response.data;
};

/**
 * Обновление своего профиля
 */
export const updateMyProfile = async (userId: number, data: ProfileUpdateRequest): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(PROFILE_ENDPOINTS.PROFILE_BY_ID(userId), data);
  return response.data;
};

// ==================== AVATAR OPERATIONS ====================

/**
 * Загрузка аватара
 */
export const uploadAvatar = async (file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<AvatarUploadResponse>(
    PROFILE_ENDPOINTS.UPLOAD_AVATAR,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

/**
 * Удаление аватара
 */
export const deleteAvatar = async (): Promise<AvatarDeleteResponse> => {
  const response = await apiClient.delete<AvatarDeleteResponse>(PROFILE_ENDPOINTS.DELETE_AVATAR);
  return response.data;
};

// ==================== DASHBOARD ====================

/**
 * Получение данных для дашборда
 */
export const getDashboard = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>(PROFILE_ENDPOINTS.DASHBOARD);
  return response.data;
};

// ==================== COMMENTS (для будущего) ====================

/**
 * Получение комментариев профиля
 */
export const getProfileComments = async (userId: number): Promise<Comment[]> => {
  const response = await apiClient.get<Comment[]>(PROFILE_ENDPOINTS.COMMENTS(userId));
  return response.data;
};

/**
 * Добавление комментария к профилю (только для teacher/admin)
 */
export const addComment = async (
  userId: number,
  data: CommentCreateRequest
): Promise<Comment> => {
  const response = await apiClient.post<Comment>(
    PROFILE_ENDPOINTS.ADD_COMMENT(userId),
    data
  );
  return response.data;
};

/**
 * Обновление комментария
 */
export const updateComment = async (
  userId: number,
  commentId: number,
  data: CommentUpdateRequest
): Promise<Comment> => {
  const response = await apiClient.put<Comment>(
    PROFILE_ENDPOINTS.UPDATE_COMMENT(userId, commentId),
    data
  );
  return response.data;
};

/**
 * Удаление комментария
 */
export const deleteComment = async (userId: number, commentId: number): Promise<void> => {
  await apiClient.delete(PROFILE_ENDPOINTS.DELETE_COMMENT(userId, commentId));
};

// ==================== ACTIVITY ====================

/**
 * Получение истории активности
 */
export const getActivities = async (
  userId: number,
  filters?: ActivityFilter
): Promise<ActivityListResponse> => {
  const response = await apiClient.get<ActivityListResponse>(
    PROFILE_ENDPOINTS.ACTIVITIES(userId),
    { params: filters }
  );
  return response.data;
};