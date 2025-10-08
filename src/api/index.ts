/**
 * Главный экспорт всех API функций
 */

// Auth API
export * as authApi from './auth';

// Profile API
export * as profileApi from './profile';

// Admin API
export * as adminApi from './admin';

// Endpoints
export * from './endpoints';

// Axios instance
export { default as apiClient } from './instance';

// Types - экспортируем только уникальные типы или через namespace
export type {
  // Auth types
  UserRole,
  UserInfo,
  Tokens,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshTokenResponse,
  MessageResponse,
  CurrentUserResponse,
  Studio,
  ApiError,
  ValidationError,
} from './auth/types';

export type {
  // Profile types
  UserProfile,
  ProfileUpdateRequest,
  AvatarUploadResponse,
  AvatarDeleteResponse,
  DashboardData,
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  RecentActivity,
  ActivityFilter,
  ActivityListResponse,
} from './profile/types';

export type {
  // Admin types
  AdminUser,
  AssignTeacherRequest,
  ChangeRoleRequest,
  AssignStudioRequest,
  CreateStudioRequest,
  UpdateStudioRequest,
  AdminActionResponse,
} from './admin/types';