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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const profile = await profileApi.getMyProfile();
      dispatch(setProfile(profile));
      
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

/**
 * Обновление профиля
 */
export const updateMyProfile = createAsyncThunk(
  'profile/updateMyProfile',
  async (data: ProfileUpdateRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUpdating(true));
      
      const updatedProfile = await profileApi.updateMyProfile(data);
      dispatch(setProfile(updatedProfile));
      
      return updatedProfile;
      
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
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadingAvatar(true));
      
      const response = await profileApi.uploadAvatar(file);
      dispatch(setAvatar(response.avatar_url));
      
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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadingAvatar(true));
      
      await profileApi.deleteAvatar();
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