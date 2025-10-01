/**
 * Profile Reducer - управление состоянием профиля
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, DashboardData } from '@/api/profile/types';

// ==================== STATE TYPE ====================

export interface ProfileState {
  // Профиль пользователя
  profile: UserProfile | null;
  
  // Dashboard данные
  dashboard: DashboardData | null;
  
  // Статусы загрузки
  isLoading: boolean;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  
  // Ошибки
  error: string | null;
  
  // Флаги для UI
  lastUpdated: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: ProfileState = {
  profile: null,
  dashboard: null,
  isLoading: false,
  isUpdating: false,
  isUploadingAvatar: false,
  error: null,
  lastUpdated: null,
};

// ==================== SLICE ====================

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Установка профиля
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    
    // Обновление профиля (частичное)
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Установка аватара
    setAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.avatar_url = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Удаление аватара
    removeAvatar: (state) => {
      if (state.profile) {
        state.profile.avatar_url = null;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Установка dashboard данных
    setDashboard: (state, action: PayloadAction<DashboardData>) => {
      state.dashboard = action.payload;
      state.error = null;
    },
    
    // Статусы загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setUploadingAvatar: (state, action: PayloadAction<boolean>) => {
      state.isUploadingAvatar = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    // Установка ошибки
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isUpdating = false;
      state.isUploadingAvatar = false;
    },
    
    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
    
    // Очистка профиля (при logout)
    clearProfile: (state) => {
      state.profile = null;
      state.dashboard = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

// ==================== EXPORTS ====================

export const {
  setProfile,
  updateProfile,
  setAvatar,
  removeAvatar,
  setDashboard,
  setLoading,
  setUpdating,
  setUploadingAvatar,
  setError,
  clearError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;