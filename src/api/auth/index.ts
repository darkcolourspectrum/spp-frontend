/**
 * API функции для Auth Service
 */

import apiClient from '../instance';
import { AUTH_ENDPOINTS } from '../endpoints';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  MessageResponse,
  CurrentUserResponse,
  Studio,
} from './types';

// ==================== AUTHENTICATION ====================

/**
 * Регистрация нового пользователя
 */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
};

/**
 * Вход в систему
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
  return response.data;
};

/**
 * Выход из системы
 */
export const logoutUser = async (): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.LOGOUT);
  return response.data;
};

/**
 * Обновление access токена через refresh token
 */
export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH);
  return response.data;
};

/**
 * Получение информации о текущем пользователе
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await apiClient.get<CurrentUserResponse>(AUTH_ENDPOINTS.ME);
  return response.data;
};

// ==================== USERS ====================

/**
 * Получение списка пользователей (только для admin)
 */
export const getUsers = async (params?: {
  role?: string;
  studio_id?: number;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}): Promise<CurrentUserResponse[]> => {
  const response = await apiClient.get<CurrentUserResponse[]>(AUTH_ENDPOINTS.USERS, { params });
  return response.data;
};

/**
 * Получение пользователя по ID
 */
export const getUserById = async (id: number): Promise<CurrentUserResponse> => {
  const response = await apiClient.get<CurrentUserResponse>(AUTH_ENDPOINTS.USER_BY_ID(id));
  return response.data;
};

// ==================== STUDIOS ====================

/**
 * Получение списка студий
 */
export const getStudios = async (params?: {
  is_active?: boolean;
}): Promise<Studio[]> => {
  const response = await apiClient.get<Studio[]>(AUTH_ENDPOINTS.STUDIOS, { params });
  return response.data;
};

/**
 * Получение студии по ID
 */
export const getStudioById = async (id: number): Promise<Studio> => {
  const response = await apiClient.get<Studio>(AUTH_ENDPOINTS.STUDIO_BY_ID(id));
  return response.data;
};