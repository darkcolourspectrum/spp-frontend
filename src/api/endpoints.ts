/**
 * API Endpoints для всех микросервисов
 * Используются относительные пути благодаря Vite proxy
 */

// ==================== AUTH SERVICE ====================
export const AUTH_ENDPOINTS = {
  // Аутентификация
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  
  // VK ID авторизация
  VK_LOGIN: '/api/auth/vk/login',
  VK_REGISTER: '/api/auth/vk/register',
  VK_REGISTER_COMPLETE: '/api/auth/vk/register/complete',
  VK_LINK: (userId: number) => `/api/auth/users/${userId}/link-vk`,
  VK_UNLINK: (userId: number) => `/api/auth/users/${userId}/unlink-vk`,

  // Управление пользователями
  USER_PROFILE: '/api/auth/users/profile',
  
  // Роли
  ROLES: '/api/auth/roles',
  
  // Студии
} as const;

// ==================== PROFILE SERVICE ====================
export const PROFILE_ENDPOINTS = {
  // Профили
  MY_PROFILE: '/api/profile/me',
  PROFILE_BY_ID: (userId: number) => `/api/profile/${userId}`,
  UPDATE_PROFILE: '/api/profile/me',
  
  // Аватары
  UPLOAD_AVATAR: (userId: number) => `/api/profile/avatars/${userId}`,
  DELETE_AVATAR: (userId: number) => `/api/profile/avatars/${userId}`,
  
  // Активность
  ACTIVITIES: (userId: number) => `/api/profile/${userId}/activities`,
} as const;


// ==================== ОБЩИЕ ====================
export const COMMON_ENDPOINTS = {
  HEALTH: '/health',
} as const;