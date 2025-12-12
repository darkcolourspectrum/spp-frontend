/**
 * Admin Action Creators (Thunks)
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '@/api/admin';
import type {
  CreateStudioRequest,
  UpdateStudioRequest,
  ClassroomCreate,
  ClassroomUpdate,
} from '@/api/admin/types';
import {
  setUsers,
  setStudios,
  setClassrooms,
  addClassroom,
  updateClassroom as updateClassroomAction,
  removeClassroom,
  setDashboardStats,
  updateUser,
  updateStudio as updateStudioAction,
  setLoadingUsers,
  setLoadingStudios,
  setLoadingClassrooms,
  setLoadingDashboard,
  setSubmitting,
  setError,
  setSuccessMessage,
} from './adminReducer';

// Хелпер для обработки ошибок
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || 'Произошла ошибка';
};

// ==================== USERS ====================

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingUsers(true));
      const users = await adminApi.getAllUsers();
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

export const changeUserRole = createAsyncThunk(
  'admin/changeRole',
  async (
    { userId, role }: { userId: number; role: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      const response = await adminApi.updateUserRole(userId, role);
      
      if (response.user) {
        dispatch(updateUser(response.user));
        dispatch(setSuccessMessage(response.message || 'Роль успешно изменена'));
      }
      
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

export const assignUserToStudio = createAsyncThunk(
  'admin/assignStudio',
  async (
    { userId, studioId }: { userId: number; studioId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      const response = await adminApi.assignUserToStudio(userId, studioId);
      
      if (response.user) {
        dispatch(updateUser(response.user));
        dispatch(setSuccessMessage(response.message || 'Студия успешно назначена'));
      }
      
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

export const activateUser = createAsyncThunk(
  'admin/activateUser',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      const response = await adminApi.activateUser(userId);
      
      if (response.user) {
        dispatch(updateUser(response.user));
        dispatch(setSuccessMessage(response.message || 'Пользователь активирован'));
      }
      
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

export const deactivateUser = createAsyncThunk(
  'admin/deactivateUser',
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      const response = await adminApi.deactivateUser(userId);
      
      if (response.user) {
        dispatch(updateUser(response.user));
        dispatch(setSuccessMessage(response.message || 'Пользователь деактивирован'));
      }
      
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

export const fetchAllStudios = createAsyncThunk(
  'admin/fetchStudios',
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

export const createNewStudio = createAsyncThunk(
  'admin/createStudio',
  async (data: CreateStudioRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      const studio = await adminApi.createStudio(data);
      dispatch(setSuccessMessage(`Студия "${studio.name}" успешно создана`));
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

export const updateExistingStudio = createAsyncThunk(
  'admin/updateStudio',
  async (
    { id, data }: { id: number; data: UpdateStudioRequest },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      const studio = await adminApi.updateStudio(id, data);
      dispatch(updateStudioAction(studio));
      dispatch(setSuccessMessage(`Студия "${studio.name}" успешно обновлена`));
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

export const deleteExistingStudio = createAsyncThunk(
  'admin/deleteStudio',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      await adminApi.deleteStudio(id);
      dispatch(setSuccessMessage('Студия успешно удалена'));
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

// ==================== CLASSROOMS ====================

export const fetchStudioClassrooms = createAsyncThunk(
  'admin/fetchClassrooms',
  async (studioId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingClassrooms(true));
      const classrooms = await adminApi.getStudioClassrooms(studioId);
      dispatch(setClassrooms(classrooms));
      return classrooms;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoadingClassrooms(false));
    }
  }
);

export const createNewClassroom = createAsyncThunk(
  'admin/createClassroom',
  async (
    { studioId, data }: { studioId: number; data: ClassroomCreate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      const classroom = await adminApi.createClassroom(studioId, data);
      dispatch(addClassroom(classroom));
      dispatch(setSuccessMessage(`Кабинет "${classroom.name}" успешно создан`));
      return classroom;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

export const updateExistingClassroom = createAsyncThunk(
  'admin/updateClassroom',
  async (
    { classroomId, data }: { classroomId: number; data: ClassroomUpdate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      const classroom = await adminApi.updateClassroom(classroomId, data);
      dispatch(updateClassroomAction(classroom));
      dispatch(setSuccessMessage(`Кабинет "${classroom.name}" успешно обновлен`));
      return classroom;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

export const deleteExistingClassroom = createAsyncThunk(
  'admin/deleteClassroom',
  async (classroomId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      await adminApi.deleteClassroom(classroomId);
      dispatch(removeClassroom(classroomId));
      dispatch(setSuccessMessage('Кабинет успешно удален'));
      return classroomId;
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

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingDashboard(true));
      const stats = await adminApi.getSystemStats();
      
      const dashboardStats = {
        totalUsers: stats.users.total,
        totalStudios: stats.studios.total,
        activeTeachers: stats.users.teachers,
        activeStudents: stats.users.students,
        totalClassrooms: stats.classrooms.total,
        activeClassrooms: stats.classrooms.active,
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