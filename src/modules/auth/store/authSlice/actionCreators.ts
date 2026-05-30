/**
 * Auth Action Creators - async thunks для работы с Auth Service
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as authApi from '@/api/auth';
import type {
  RegisterRequest,
  LoginRequest,
  VkLoginRequest,
  VkRegisterRequest,
  VkRegisterCompleteRequest,
} from '@/api/auth/types';
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
    const detail = error.response?.data?.detail;
    
    // Pydantic 422 — detail это массив объектов
    if (Array.isArray(detail)) {
      return detail
        .map((err: any) => {
          const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
          return field ? `${field}: ${err.msg}` : err.msg;
        })
        .join('; ');
    }
    
    // Обычная ошибка — detail это строка
    if (typeof detail === 'string') {
      return detail;
    }
    
    return error.message || 'Произошла ошибка';
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
      
      // Очищаем профиль предыдущего пользователя если был
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());

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
 * Вход через VK.
 *
 * Принимает данные, собранные на callback-странице из VK SDK
 * (code/device_id/code_verifier). Бэк обменяет code на vk_id и вернёт
 * токены либо 404 (нет аккаунта). Кладёт токен+юзера через setAuth -
 * тем же путём, что обычный вход. Зеркалит login (с очисткой профиля
 * предыдущего пользователя).
 */
export const vkLogin = createAsyncThunk(
  'auth/vkLogin',
  async (data: VkLoginRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Очищаем профиль предыдущего пользователя если был
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());

      const response = await authApi.vkLogin(data);

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
 * Регистрация через VK, шаг 1.
 *
 * Бэк обменивает код и возвращает один из двух исходов:
 *  - needs_email=false: аккаунт создан -> кладём токены через setAuth
 *    (пользователь сразу залогинен), возвращаем результат компоненту.
 *  - needs_email=true: нужен email -> НЕ трогаем авторизацию, просто
 *    возвращаем результат, чтобы компонент показал форму ввода email.
 *
 * Возвращает весь VkRegisterResponse, чтобы компонент сам разветвил логику.
 */
export const vkRegister = createAsyncThunk(
  'auth/vkRegister',
  async (data: VkRegisterRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await authApi.vkRegister(data);

      // Аккаунт создан сразу — логиним.
      if (!response.needs_email && response.auth) {
        dispatch(setAuth({
          accessToken: response.auth.tokens.access_token,
          user: response.auth.user,
        }));
      }

      // В обоих случаях возвращаем результат — компонент решит, что дальше.
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
 * Регистрация через VK, шаг 2 — завершение с введённым email.
 * Всегда возвращает токены (как обычная регистрация) -> логиним через setAuth.
 */
export const vkRegisterComplete = createAsyncThunk(
  'auth/vkRegisterComplete',
  async (data: VkRegisterCompleteRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await authApi.vkRegisterComplete(data);

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
 * Выход из системы
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      // Вызываем API для инвалидации токенов на сервере
      await authApi.logoutUser();
      
      // Очищаем состояние auth и profile - чтобы при следующем
      // логине не показывались данные предыдущего пользователя
      dispatch(logout());
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());
      
      return true;
      
    } catch (error) {
      // Очищаем состояние auth и profile - чтобы при следующем
      // логине не показывались данные предыдущего пользователя
      dispatch(logout());
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());
      
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
      // Очищаем состояние auth и profile - чтобы при следующем
      // логине не показывались данные предыдущего пользователя
      dispatch(logout());
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());
      
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
          vk_linked: user.vk_linked,
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
          vk_linked: user.vk_linked,
        },
      }));
      
      return true;
      
    } catch (error) {
      // Нет активной сессии
      // Очищаем состояние auth и profile - чтобы при следующем
      // логине не показывались данные предыдущего пользователя
      dispatch(logout());
      const { clearProfile } = await import('@/modules/profile/store');
      dispatch(clearProfile());
      return rejectWithValue('No active session');
    }
  }
);