/**
 * Admin Reducer - управление состоянием админ-панели
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser, Studio, DashboardStats, Classroom } from '@/api/admin/types';

// ==================== STATE TYPE ====================

export interface AdminState {
  // Списки
  users: AdminUser[];
  studios: Studio[];
  classrooms: Classroom[];  // ← ДОБАВЛЕНО
  
  // Dashboard статистика
  dashboardStats: DashboardStats | null;
  
  // Фильтры
  filters: {
    roleFilter: string;
    studioFilter: string;
    searchQuery: string;
  };
  
  // Статусы загрузки
  isLoadingUsers: boolean;
  isLoadingStudios: boolean;
  isLoadingClassrooms: boolean;  // ← ДОБАВЛЕНО
  isLoadingDashboard: boolean;
  isSubmitting: boolean;
  
  // Ошибки
  error: string | null;
  
  // Сообщения
  successMessage: string | null;
  
  // Последнее обновление
  lastUpdated: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: AdminState = {
  users: [],
  studios: [],
  classrooms: [],  // ← ДОБАВЛЕНО
  dashboardStats: null,
  filters: {
    roleFilter: '',
    studioFilter: '',
    searchQuery: '',
  },
  isLoadingUsers: false,
  isLoadingStudios: false,
  isLoadingClassrooms: false,  // ← ДОБАВЛЕНО
  isLoadingDashboard: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
  lastUpdated: null,
};

// ==================== SLICE ====================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Установка пользователей
    setUsers: (state, action: PayloadAction<AdminUser[]>) => {
      state.users = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    
    // Установка студий
    setStudios: (state, action: PayloadAction<Studio[]>) => {
      state.studios = action.payload;
      state.error = null;
    },
    
    // Установка кабинетов
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      state.error = null;
    },
    
    // Добавление кабинета
    addClassroom: (state, action: PayloadAction<Classroom>) => {
      state.classrooms.push(action.payload);
    },
    
    // Обновление кабинета
    updateClassroom: (state, action: PayloadAction<Classroom>) => {
      const index = state.classrooms.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classrooms[index] = action.payload;
      }
    },
    
    // Удаление кабинета
    removeClassroom: (state, action: PayloadAction<number>) => {
      state.classrooms = state.classrooms.filter(c => c.id !== action.payload);
    },
    
    // Установка статистики дашборда
    setDashboardStats: (state, action: PayloadAction<DashboardStats>) => {
      state.dashboardStats = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    
    // Обновление одного пользователя в списке
    updateUser: (state, action: PayloadAction<AdminUser>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    
    // Обновление студии
    updateStudio: (state, action: PayloadAction<Studio>) => {
      const index = state.studios.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.studios[index] = action.payload;
      }
    },
    
    // Установка фильтра роли
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.filters.roleFilter = action.payload;
    },
    
    // Установка фильтра студии
    setStudioFilter: (state, action: PayloadAction<string>) => {
      state.filters.studioFilter = action.payload;
    },
    
    // Установка поискового запроса
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    
    // Сброс всех фильтров
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Статусы загрузки
    setLoadingUsers: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUsers = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setLoadingStudios: (state, action: PayloadAction<boolean>) => {
      state.isLoadingStudios = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setLoadingClassrooms: (state, action: PayloadAction<boolean>) => {
      state.isLoadingClassrooms = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setLoadingDashboard: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDashboard = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
      if (action.payload) {
        state.error = null;
        state.successMessage = null;
      }
    },
    
    // Установка ошибки
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingUsers = false;
      state.isLoadingStudios = false;
      state.isLoadingClassrooms = false;
      state.isLoadingDashboard = false;
      state.isSubmitting = false;
    },
    
    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
    
    // Установка success сообщения
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },
    
    // Очистка success сообщения
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Очистка всех данных админки (при logout)
    clearAdminData: (state) => {
      state.users = [];
      state.studios = [];
      state.classrooms = [];
      state.dashboardStats = null;
      state.filters = initialState.filters;
      state.error = null;
      state.successMessage = null;
      state.lastUpdated = null;
    },
  },
});

// ==================== EXPORTS ====================

export const {
  setUsers,
  setStudios,
  setClassrooms,
  addClassroom,
  updateClassroom,
  removeClassroom,
  setDashboardStats,
  updateUser,
  updateStudio,
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  setLoadingUsers,
  setLoadingStudios,
  setLoadingClassrooms,
  setLoadingDashboard,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearAdminData,
} = adminSlice.actions;

export default adminSlice.reducer;