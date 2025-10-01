/**
 * Auth Action Creators - async thunks для работы с Auth Service
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as authApi from '@/api/auth';
import type { RegisterRequest, LoginRequest, ApiError } from '@/api/auth/types';
import {
  setAuth,
  setLoading,
  setError,
  logout,
  incrementLoginAttempts,
  resetLoginAttempts,
  setAccessToken,
} from './authReducer';

// ==================== HELPER FUNCTIONS ====================

/**
 * Извлечение сообщения об ошибке из ответа API
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.detail || error.message || 'Произошла ошибка';
  }
  return 'Произошла неизвестная ошибка';
};

// ==================== ASYNC THUNKS ====================

/**
 * Регистрация нового пользователя
 */
export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await authApi.registerUser(data);
      
      // Сохраняем токен и пользователя в store
      dispatch(setAuth({
        accessToken: response.tokens.access_token,
        user: response.user,
      }));
      
      return response;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Вход в систему
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await authApi.loginUser(credentials);
      
      // Сохраняем токен и пользователя в store
      dispatch(setAuth({
        accessToken: response.tokens.access_token,
        user: response.user,
      }));
      
      // Сбрасываем счетчик попыток при успешном входе
      dispatch(resetLoginAttempts());
      
      return response;
      
    } catch (error) {
      // Увеличиваем счетчик неудачных попыток
      dispatch(incrementLoginAttempts());
      
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Выход из системы
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      // Вызываем API для инвалидации токенов на сервере
      await authApi.logoutUser();
      
      // Очищаем состояние
      dispatch(logout());
      
      return true;
      
    } catch (error) {
      // Даже если API запрос failed, всё равно очищаем состояние
      dispatch(logout());
      
      const errorMessage = getErrorMessage(error);
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Обновление access токена через refresh token
 */
export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.refreshAccessToken();
      
      // Обновляем только access token
      dispatch(setAccessToken(response.access_token));
      
      return response;
      
    } catch (error) {
      // Если refresh не удался - выходим
      dispatch(logout());
      
      const errorMessage = getErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Получение текущего пользователя (для восстановления сессии)
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const user = await authApi.getCurrentUser();
      
      // Обновляем только информацию о пользователе
      // (токен уже есть в store)
      dispatch(setAuth({
        accessToken: '', // Токен уже в store, не перезаписываем
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          role: user.role,
          studio_id: user.studio_id,
          studio_name: user.studio_name,
          is_active: user.is_active,
          is_verified: user.is_verified,
        },
      }));
      
      return user;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Проверка активности сессии
 * Вызывается при монтировании приложения
 */
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Пытаемся обновить токен
      const refreshResponse = await authApi.refreshAccessToken();
      dispatch(setAccessToken(refreshResponse.access_token));
      
      // Получаем информацию о пользователе
      const user = await authApi.getCurrentUser();
      dispatch(setAuth({
        accessToken: refreshResponse.access_token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          role: user.role,
          studio_id: user.studio_id,
          studio_name: user.studio_name,
          is_active: user.is_active,
          is_verified: user.is_verified,
        },
      }));
      
      return true;
      
    } catch (error) {
      // Нет активной сессии
      dispatch(logout());
      return rejectWithValue('No active session');
    }
  }
);