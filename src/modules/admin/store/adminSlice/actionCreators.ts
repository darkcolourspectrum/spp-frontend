/**
 * Admin Action Creators - async thunks для админ-панели
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as adminApi from '@/api/admin/index';
import type { CreateStudioRequest, UpdateStudioRequest, DashboardStats } from '@/api/admin/types';
import {
  setUsers,
  setStudios,
  setDashboardStats,
  setLoadingUsers,
  setLoadingStudios,
  setLoadingDashboard,
  setSubmitting,
  setError,
  setSuccessMessage,
} from './adminReducer';

// ==================== HELPER FUNCTIONS ====================

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail || error.message || 'Произошла ошибка';
  }
  return 'Произошла неизвестная ошибка';
};

// ==================== USER MANAGEMENT ====================

/**
 * Загрузка всех пользователей
 */
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (
    params: { limit?: number; offset?: number; role?: string; studio_id?: number } | undefined,
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoadingUsers(true));

      const users = await adminApi.getAllUsers(params);
      dispatch(setUsers(users));

      return users;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoadingUsers(false));
    }
  }
);

/**
 * Изменение роли пользователя
 */
export const changeUserRole = createAsyncThunk(
  'admin/changeUserRole',
  async (data: { userId: number; role: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      const response = await adminApi.updateUserRole(data.userId, data.role);
      dispatch(setSuccessMessage(response.message));

      // Перезагружаем пользователей
      await dispatch(fetchAllUsers());

      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

/**
 * Привязка пользователя к студии
 */
export const assignUserToStudio = createAsyncThunk(
  'admin/assignUserToStudio',
  async (data: { userId: number; studioId: number }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      const response = await adminApi.assignUserToStudio(data.userId, data.studioId);
      dispatch(setSuccessMessage(response.message));

      // Перезагружаем пользователей
      await dispatch(fetchAllUsers());

      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

/**
 * Активация пользователя
 */
export const activateUser = createAsyncThunk(
  'admin/activateUser',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      const response = await adminApi.activateUser(userId);
      dispatch(setSuccessMessage(response.message));

      // Перезагружаем пользователей
      await dispatch(fetchAllUsers());

      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

/**
 * Деактивация пользователя
 */
export const deactivateUser = createAsyncThunk(
  'admin/deactivateUser',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      const response = await adminApi.deactivateUser(userId);
      dispatch(setSuccessMessage(response.message));

      // Перезагружаем пользователей
      await dispatch(fetchAllUsers());

      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// ==================== STUDIOS ====================

/**
 * Загрузка всех студий
 */
export const fetchAllStudios = createAsyncThunk(
  'admin/fetchAllStudios',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingStudios(true));

      const studios = await adminApi.getAllStudios();
      dispatch(setStudios(studios));

      return studios;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoadingStudios(false));
    }
  }
);

/**
 * Создание новой студии
 */
export const createNewStudio = createAsyncThunk(
  'admin/createStudio',
  async (data: CreateStudioRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      const studio = await adminApi.createStudio(data);
      dispatch(setSuccessMessage(`Студия "${studio.name}" успешно создана`));

      // Перезагружаем студии
      await dispatch(fetchAllStudios());

      return studio;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

/**
 * Обновление студии
 */
export const updateExistingStudio = createAsyncThunk(
  'admin/updateStudio',
  async (
    { id, data }: { id: number; data: UpdateStudioRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));

      const studio = await adminApi.updateStudio(id, data);
      dispatch(setSuccessMessage(`Студия "${studio.name}" успешно обновлена`));

      // Перезагружаем студии
      await dispatch(fetchAllStudios());

      return studio;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

/**
 * Удаление студии
 */
export const deleteExistingStudio = createAsyncThunk(
  'admin/deleteStudio',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));

      await adminApi.deleteStudio(id);
      dispatch(setSuccessMessage('Студия успешно удалена'));

      // Перезагружаем студии
      await dispatch(fetchAllStudios());

      return id;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// ==================== DASHBOARD ====================

/**
 * Загрузка статистики для дашборда
 */
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingDashboard(true));

      const systemStats = await adminApi.getSystemStats();

      // Формируем статистику для UI
      const dashboardStats: DashboardStats = {
        totalUsers: systemStats.users.total,
        totalStudios: systemStats.studios.total,
        activeTeachers: systemStats.users.teachers,
        activeStudents: systemStats.users.students,
        totalClassrooms: systemStats.classrooms.total,
        activeClassrooms: systemStats.classrooms.active,
      };

      dispatch(setDashboardStats(dashboardStats));

      return dashboardStats;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoadingDashboard(false));
    }
  }
);