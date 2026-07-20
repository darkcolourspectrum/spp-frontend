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
} from './types';

// ==================== PROFILE OPERATIONS ====================

/**
 * Получение своего профиля
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
export const uploadAvatar = async (userId: number, file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<AvatarUploadResponse>(
    PROFILE_ENDPOINTS.UPLOAD_AVATAR(userId),
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
export const deleteAvatar = async (userId: number): Promise<AvatarDeleteResponse> => {
  const response = await apiClient.delete<AvatarDeleteResponse>(
    PROFILE_ENDPOINTS.DELETE_AVATAR(userId)
  );
  return response.data;
};