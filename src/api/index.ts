/**
 * Главный экспорт всех API функций
 */

// Auth API
export * from './auth';
export * as authApi from './auth';

// Profile API
export * from './profile';
export * as profileApi from './profile';

// Endpoints
export * from './endpoints';

// Axios instance
export { default as apiClient } from './instance';

// Types
export type * from './auth/types';
export type * from './profile/types';