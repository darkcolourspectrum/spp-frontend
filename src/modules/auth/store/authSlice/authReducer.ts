/**
 * Auth Reducer - управление состоянием аутентификации
 * Access token хранится ТОЛЬКО здесь (в памяти приложения)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo } from '@/api/auth/types';

// ==================== STATE TYPE ====================

export interface AuthState {
  // Токен доступа (хранится ТОЛЬКО в памяти)
  accessToken: string | null;
  
  // Информация о пользователе
  user: UserInfo | null;
  
  // Статусы
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Ошибки
  error: string | null;
  
  // Флаги для UI
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

// ==================== INITIAL STATE ====================

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// ==================== SLICE ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Установка токена и пользователя после успешной аутентификации
    setAuth: (state, action: PayloadAction<{ accessToken: string; user: UserInfo }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
    },
    
    // Обновление только access токена (после refresh)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    
    // Обновление информации о пользователе
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
    },
    
    // Начало загрузки (login/register/refresh)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    // Установка ошибки
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
    
    // Увеличение счетчика попыток входа
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();
    },
    
    // Сброс счетчика попыток
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    
    // Выход из системы (полная очистка состояния)
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
});

// ==================== EXPORTS ====================

export const {
  setAuth,
  setAccessToken,
  setUser,
  setLoading,
  setError,
  clearError,
  incrementLoginAttempts,
  resetLoginAttempts,
  logout,
} = authSlice.actions;

export default authSlice.reducer;