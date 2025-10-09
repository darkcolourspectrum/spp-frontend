/**
 * Admin Action Creators - async thunks для админ-панели
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as adminApi from '@/api/admin/index';
import type {
  AssignTeacherRequest,
  ChangeRoleRequest,
  AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  DashboardStats,
} from '@/api/admin/types';
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

// ==================== ASYNC THUNKS ====================

/**
 * Загрузка всех пользователей
 */
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params: { limit?: number; offset?: number; role?: string; studio_id?: number } | undefined, { dispatch, rejectWithValue }) => {
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
 * Загрузка статистики для дашборда
 */
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingDashboard(true));
      
      // Загружаем только системную статистику
      const systemStats = await adminApi.getSystemStats();
      
      // Формируем статистику для UI
      const dashboardStats: DashboardStats = {
        totalUsers: systemStats.users.total_users,
        totalStudios: 0, // Пока не загружаем студии для дашборда
        activeTeachers: systemStats.users.total_teachers,
        activeStudents: systemStats.users.total_students,
        totalComments: systemStats.content.total_comments,
        totalActivities: systemStats.content.total_activities,
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

/**
 * Назначение роли преподавателя
 */
export const assignTeacher = createAsyncThunk(
  'admin/assignTeacher',
  async (data: AssignTeacherRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await adminApi.assignTeacherRole(data);
      dispatch(setSuccessMessage(response.message));
      
      // Перезагружаем пользователей после успешного назначения
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
 * Изменение роли пользователя
 */
export const changeRole = createAsyncThunk(
  'admin/changeRole',
  async (data: ChangeRoleRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await adminApi.changeUserRole(data);
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
export const assignStudio = createAsyncThunk(
  'admin/assignStudio',
  async (data: AssignStudioRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await adminApi.assignUserToStudio(data);
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
  async ({ id, data }: { id: number; data: UpdateStudioRequest }, { dispatch, rejectWithValue }) => {
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
 * Активация студии
 */
export const activateExistingStudio = createAsyncThunk(
  'admin/activateStudio',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await adminApi.activateStudio(id);
      dispatch(setSuccessMessage(response.message));
      
      // Перезагружаем студии
      await dispatch(fetchAllStudios());
      
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
 * Деактивация студии
 */
export const deactivateExistingStudio = createAsyncThunk(
  'admin/deactivateStudio',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await adminApi.deactivateStudio(id);
      dispatch(setSuccessMessage(response.message));
      
      // Перезагружаем студии
      await dispatch(fetchAllStudios());
      
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