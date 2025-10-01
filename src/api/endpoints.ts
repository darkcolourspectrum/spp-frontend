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
  
  // Управление пользователями
  USERS: '/api/auth/users',
  USER_BY_ID: (id: number) => `/api/auth/users/${id}`,
  
  // Роли
  ROLES: '/api/auth/roles',
  
  // Студии
  STUDIOS: '/api/auth/studios',
  STUDIO_BY_ID: (id: number) => `/api/auth/studios/${id}`,
} as const;

// ==================== PROFILE SERVICE ====================
export const PROFILE_ENDPOINTS = {
  // Профили
  MY_PROFILE: '/api/profile/me',
  PROFILE_BY_ID: (userId: number) => `/api/profile/${userId}`,
  UPDATE_PROFILE: '/api/profile/me',
  
  // Аватары
  UPLOAD_AVATAR: '/api/profile/me/avatar',
  DELETE_AVATAR: '/api/profile/me/avatar',
  
  // Дашборд
  DASHBOARD: '/api/profile/dashboard',
  
  // Комментарии
  COMMENTS: (userId: number) => `/api/profile/${userId}/comments`,
  ADD_COMMENT: (userId: number) => `/api/profile/${userId}/comments`,
  UPDATE_COMMENT: (userId: number, commentId: number) => 
    `/api/profile/${userId}/comments/${commentId}`,
  DELETE_COMMENT: (userId: number, commentId: number) => 
    `/api/profile/${userId}/comments/${commentId}`,
  
  // Активность
  ACTIVITIES: (userId: number) => `/api/profile/${userId}/activities`,
} as const;

// ==================== SCHEDULE SERVICE ====================
export const SCHEDULE_ENDPOINTS = {
  // Расписание преподавателя
  TEACHER_SCHEDULE: '/api/schedule/teacher/my-schedule',
  TEACHER_AVAILABLE_SLOTS: '/api/schedule/teacher/available-slots',
  TEACHER_RESERVE_SLOT: '/api/schedule/teacher/reserve-slot',
  TEACHER_CREATE_LESSON: '/api/schedule/teacher/create-lesson',
  TEACHER_CANCEL_LESSON: (lessonId: number) => 
    `/api/schedule/teacher/lessons/${lessonId}/cancel`,
  TEACHER_COMPLETE_LESSON: (lessonId: number) => 
    `/api/schedule/teacher/lessons/${lessonId}/complete`,
  
  // Расписание студента
  STUDENT_SCHEDULE: '/api/schedule/student/my-schedule',
  STUDENT_AVAILABLE_LESSONS: '/api/schedule/student/available-lessons',
  STUDENT_ENROLL: (lessonId: number) => 
    `/api/schedule/student/lessons/${lessonId}/enroll`,
  STUDENT_CANCEL: (lessonId: number) => 
    `/api/schedule/student/lessons/${lessonId}/cancel`,
  
  // Расписание студии (для админа)
  STUDIO_SCHEDULE: (studioId: number) => 
    `/api/schedule/admin/studios/${studioId}/schedule`,
  STUDIO_GENERATE_SLOTS: (studioId: number) => 
    `/api/schedule/admin/studios/${studioId}/generate-slots`,
  
  // Статистика
  STATISTICS: '/api/schedule/admin/statistics',
} as const;

// ==================== ОБЩИЕ ====================
export const COMMON_ENDPOINTS = {
  HEALTH: '/health',
} as const;