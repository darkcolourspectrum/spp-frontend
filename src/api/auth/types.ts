/**
 * Типы для Auth Service API
 */

// ==================== ОБЩИЕ ТИПЫ ====================

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  studio_id: number | null;
  studio_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  vk_linked?: boolean;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ==================== REQUEST TYPES ====================

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  privacy_policy_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token?: string; // Опционально, если не в cookie
}

// ==================== RESPONSE TYPES ====================

export interface AuthResponse {
  user: UserInfo;
  tokens: Tokens;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

export interface CurrentUserResponse extends UserInfo {
  phone: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  vk_linked?: boolean;
}


// ==================== ERROR TYPES ====================

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// ==================== VK ID TYPES ====================

/**
 * Данные, которые фронт получает от VK ID SDK после авторизации
 * и шлёт на бэк. Бэк сам обменяет code на проверенный vk_id.
 */
export interface VkAuthPayload {
  code: string;
  device_id: string;
  code_verifier: string;
  state?: string;
}

/**
 * Тело входа через VK (POST /api/auth/vk/login).
 */
export type VkLoginRequest = VkAuthPayload;

/**
 * Тело регистрации через VK, шаг 1 (POST /api/auth/vk/register).
 * email опционален: если фронт его знает — шлёт, иначе бэк попробует
 * взять из VK, а если нет — вернёт needs_email.
 */
export interface VkRegisterRequest extends VkAuthPayload {
  email?: string;
}

/**
 * Ответ шага 1 регистрации.
 * - needs_email=false: аккаунт создан, данные входа в auth.
 * - needs_email=true: нужен email, аккаунт не создан; registration_token
 *   и имя/фамилия — для второго шага и предзаполнения формы.
 */
export interface VkRegisterResponse {
  needs_email: boolean;
  auth?: AuthResponse;
  registration_token?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Тело завершения регистрации через VK, шаг 2
 * (POST /api/auth/vk/register/complete).
 */
export interface VkRegisterCompleteRequest {
  registration_token: string;
  email: string;
}

/**
 * Тело привязки VK к существующему аккаунту
 * (POST /api/auth/users/{id}/link-vk).
 */
export type VkLinkRequest = VkAuthPayload;