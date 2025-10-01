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
}

// ==================== STUDIO TYPES ====================

export interface Studio {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  teachers_count: number;
  students_count: number;
  created_at: string;
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