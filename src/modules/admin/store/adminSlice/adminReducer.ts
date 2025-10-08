/**
 * Admin Reducer - управление состоянием админ-панели
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser, Studio } from '@/api/admin/types';

// ==================== STATE TYPE ====================

export interface AdminState {
  // Списки
  users: AdminUser[];
  studios: Studio[];
  
  // Фильтры
  filters: {
    roleFilter: string;
    studioFilter: string;
    searchQuery: string;
  };
  
  // Статусы загрузки
  isLoadingUsers: boolean;
  isLoadingStudios: boolean;
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
  filters: {
    roleFilter: '',
    studioFilter: '',
    searchQuery: '',
  },
  isLoadingUsers: false,
  isLoadingStudios: false,
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
    
    // Обновление одного пользователя в списке
    updateUser: (state, action: PayloadAction<AdminUser>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
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
  updateUser,
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  setLoadingUsers,
  setLoadingStudios,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearAdminData,
} = adminSlice.actions;

export default adminSlice.reducer;