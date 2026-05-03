/**
 * Profile Action Creators - async thunks для работы с Profile Service
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as profileApi from '@/api/profile';
import type { ProfileUpdateRequest } from '@/api/profile/types';
import {
  setProfile,
  setDashboard,
  setLoading,
  setUpdating,
  setUploadingAvatar,
  setError,
  setAvatar,
  removeAvatar,
} from './profileReducer';
import * as authApi from '@/api/auth';

// ==================== HELPER FUNCTIONS ====================

/**
 * Извлечение сообщения об ошибке
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail || error.message || 'Произошла ошибка';
  }
  return 'Произошла неизвестная ошибка';
};

// ==================== ASYNC THUNKS ====================

/**
 * Получение своего профиля
 */
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const profile = await profileApi.getMyProfile(userId);
      dispatch(setProfile(profile));
      
      return profile;
    }  
    catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Обновление профиля
 */
export const updateMyProfile = createAsyncThunk(
  'profile/updateMyProfile',
  async ({ userId, data }: { userId: number; data: ProfileUpdateRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUpdating(true));

      // Разделяем поля по владельцу:
      // - first_name/last_name/phone -> Auth Service
      // - bio/display_name/avatar и пр. -> Profile Service
      const authData: { first_name?: string; last_name?: string; phone?: string } = {};
      const profileData: ProfileUpdateRequest = {};

      if (data.first_name !== undefined) authData.first_name = data.first_name;
      if (data.last_name !== undefined) authData.last_name = data.last_name;
      if ((data as any).phone !== undefined) authData.phone = (data as any).phone;

      // Всё остальное идёт в Profile
      Object.keys(data).forEach((key) => {
        if (key !== 'first_name' && key !== 'last_name' && key !== 'phone') {
          (profileData as any)[key] = (data as any)[key];
        }
      });

      // Запросы параллельно. Если Auth-часть пуста, делаем только Profile, и наоборот.
      const promises: Promise<unknown>[] = [];

      if (Object.keys(authData).length > 0) {
        promises.push(authApi.updateMyAuthProfile(authData));
      }

      if (Object.keys(profileData).length > 0) {
        promises.push(profileApi.updateMyProfile(userId, profileData));
      }

      await Promise.all(promises);

      // Read-your-writes: запрашиваем свежий профиль из Profile Service.
      // Profile при is_own_profile=True ходит в Auth по HTTP напрямую
      // (см. ProfileService.get_profile_by_user_id) - так что first_name/last_name
      // приходят гарантированно свежие, без ожидания event-driven синхронизации.
      // Никаких setTimeout не нужно - это не гонка с RabbitMQ, а прямой HTTP.
      const fresh = await profileApi.getMyProfile(userId);
      dispatch(setProfile(fresh));

      return fresh;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }
);

/**
 * Загрузка аватара
 */
export const uploadAvatarFile = createAsyncThunk(
  'profile/uploadAvatar',
  async ({ userId, file }: { userId: number; file: File }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadingAvatar(true));
      
      const response = await profileApi.uploadAvatar(userId, file);
      dispatch(setAvatar(response.url));
      
      return response;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setUploadingAvatar(false));
    }
  }
);

/**
 * Удаление аватара
 */
export const deleteAvatarFile = createAsyncThunk(
  'profile/deleteAvatar',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadingAvatar(true));
      
      await profileApi.deleteAvatar(userId);
      dispatch(removeAvatar());
      
      return true;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setUploadingAvatar(false));
    }
  }
);

/**
 * Получение dashboard данных
 */
export const fetchDashboard = createAsyncThunk(
  'profile/fetchDashboard',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const dashboard = await profileApi.getDashboard();
      dispatch(setDashboard(dashboard));
      
      return dashboard;
      
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
 * Получение профиля другого пользователя (для просмотра)
 */
export const fetchProfileById = createAsyncThunk(
  'profile/fetchProfileById',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const profile = await profileApi.getProfileById(userId);
      
      return profile;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);