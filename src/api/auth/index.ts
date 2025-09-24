// === REQUEST TYPES ===

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  privacy_policy_accepted: boolean;
}

// === RESPONSE TYPES ===

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  studio_id: number | null;
  studio_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  // Дополнительные поля из /me endpoint
  is_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
  permissions: string[];
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
}

export interface ValidationErrorResponse {
  detail: string;
  errors?: Record<string, string[]>;
}

// === AUTH CONTEXT TYPES ===

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  // Методы аутентификации
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  
  // Управление токенами
  updateAccessToken: (token: string) => void;
  refreshAuth: () => Promise<boolean>;
  
  // Проверка ролей и разрешений
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  
  // Проверки
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

// === ROLE TYPES ===

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface RolePermissions {
  [key: string]: string[];
}

// === AUTH HOOK TYPES ===

export interface UseAuthReturn extends AuthContextType {}

// === API ERROR TYPES ===

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export class TokenExpiredError extends AuthApiError {
  constructor() {
    super('Token expired', 401, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class TokenBlacklistedError extends AuthApiError {
  constructor() {
    super('Token blacklisted', 401, 'TOKEN_BLACKLISTED');
    this.name = 'TokenBlacklistedError';
  }
}

export class RateLimitError extends AuthApiError {
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds`, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// === AUTH SERVICE CONFIG ===

export interface AuthServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  tokenRefreshBuffer: number; // минут до истечения токена, когда начинать refresh
}