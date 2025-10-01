/**
 * Auth Store - экспорт всех компонентов auth модуля
 */

// Reducer
export { default as authReducer } from './authSlice/authReducer';

// Actions
export {
  setAuth,
  setAccessToken,
  setUser,
  setLoading,
  setError,
  clearError,
  incrementLoginAttempts,
  resetLoginAttempts,
  logout,
} from './authSlice/authReducer';

// Action Creators (Thunks)
export {
  register,
  login,
  logoutUser,
  refreshToken,
  fetchCurrentUser,
  checkAuthStatus,
} from './authSlice/actionCreators';

// Types
export type { AuthState } from './authSlice/authReducer';