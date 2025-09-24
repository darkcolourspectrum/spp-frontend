import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApiService } from '../../api/auth';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthApiError 
} from '../../api/auth/types';

// === STATE INTERFACE ===
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // UI состояния
  loginLoading: boolean;
  registerLoading: boolean;
  
  // Дополнительная информация
  lastLoginTime: string | null;
  authCheckTime: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginLoading: false,
  registerLoading: false,
  lastLoginTime: null,
  authCheckTime: null,
};

// === ASYNC THUNKS ===

/**
 * Авторизация пользователя
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApiService.login(credentials);
      return {
        user: response.user,
        accessToken: response.tokens.access_token,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Ошибка авторизации';
      return rejectWithValue(message);
    }
  }
);

/**
 * Регистрация пользователя
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApiService.register(userData);
      return {
        user: response.user,
        accessToken: response.tokens.access_token,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Ошибка регистрации';
      return rejectWithValue(message);
    }
  }
);

/**
 * Получение данных текущего пользователя
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApiService.getCurrentUser();
      return {
        user,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Ошибка получения данных';
      return rejectWithValue(message);
    }
  }
);

/**
 * Выход из системы
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApiService.safeLogout();
      return true;
    } catch (error: any) {
      // Даже при ошибке на сервере, очищаем локальное состояние
      console.error('Logout error:', error);
      return true;
    }
  }
);

/**
 * Выход со всех устройств
 */
export const logoutAllDevices = createAsyncThunk(
  'auth/logoutAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApiService.logoutAllDevices();
      return response.message;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Ошибка выхода';
      return rejectWithValue(message);
    }
  }
);

/**
 * Проверка аутентификации при инициализации
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authApiService.checkAuth();
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue('Ошибка проверки аутентификации');
    }
  }
);

// === SLICE ===
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Обновление access токена (вызывается из AuthContext)
    tokenUpdated: (state, action: PayloadAction<string>) => {
      // В Redux мы не храним сам токен, только отмечаем что он обновился
      state.error = null;
      state.authCheckTime = new Date().toISOString();
    },

    // Очистка состояния аутентификации
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLoginTime = null;
      state.authCheckTime = null;
    },

    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },

    // Обновление данных пользователя
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // === LOGIN ===
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.lastLoginTime = action.payload.timestamp;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload as string;
      })

      // === REGISTER ===
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.lastLoginTime = action.payload.timestamp;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload as string;
      })

      // === FETCH CURRENT USER ===
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authCheckTime = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // === LOGOUT ===
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
        state.authCheckTime = null;
      })

      // === CHECK AUTH ===
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isAuthenticated && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.authCheckTime = action.payload.timestamp;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

// === ACTIONS ===
export const { tokenUpdated, clearAuth, clearError, updateUser } = authSlice.actions;

// === SELECTORS ===
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginLoading = (state: { auth: AuthState }) => state.auth.loginLoading;
export const selectRegisterLoading = (state: { auth: AuthState }) => state.auth.registerLoading;

// Helper селекторы для ролей
export const selectIsAdmin = (state: { auth: AuthState }) => 
  state.auth.user?.is_admin || false;
  
export const selectIsTeacher = (state: { auth: AuthState }) => 
  state.auth.user?.is_teacher || false;
  
export const selectIsStudent = (state: { auth: AuthState }) => 
  state.auth.user?.is_student || false;

export const selectHasRole = (roles: string | string[]) => 
  (state: { auth: AuthState }) => {
    if (!state.auth.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.auth.user.role);
  };

export default authSlice.reducer;