// API endpoints constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me'
  },
  PROFILE: {
    GET: '/api/v1/profiles',
    UPDATE: '/api/v1/profiles',
    UPLOAD_AVATAR: '/api/v1/profiles/avatar',
    DASHBOARD: '/api/v1/profiles/dashboard'
  },
  SCHEDULE: {
    GET_SCHEDULE: '/api/v1/schedule',
    CREATE_LESSON: '/api/v1/lessons',
    UPDATE_LESSON: '/api/v1/lessons',
    DELETE_LESSON: '/api/v1/lessons'
  },
  ADMIN: {
    USERS: '/api/v1/admin/users',
    STUDIOS: '/api/v1/admin/studios',
    STATS: '/api/v1/admin/stats'
  }
} as const;

export const BASE_URLS = {
  AUTH_SERVICE: 'http://localhost:8000',
  PROFILE_SERVICE: 'http://localhost:8002', 
  SCHEDULE_SERVICE: 'http://localhost:8001'
} as const;