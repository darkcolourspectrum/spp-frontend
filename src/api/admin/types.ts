/**
 * Типы для Admin API
 */

// Расширенная информация о пользователе для админки
export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  role: string;
  studio_id: number | null;
  studio_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  login_attempts: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at: string | null;
}

// Информация о студии
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

// Запрос на назначение преподавателя
export interface AssignTeacherRequest {
  user_id: number;
  studio_id: number;
}

// Запрос на изменение роли
export interface ChangeRoleRequest {
  user_id: number;
  role: 'admin' | 'teacher' | 'student' | 'guest';
}

// Запрос на привязку к студии
export interface AssignStudioRequest {
  user_id: number;
  studio_id: number;
}

// Создание студии
export interface CreateStudioRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Обновление студии
export interface UpdateStudioRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

// Ответ с сообщением
export interface AdminActionResponse {
  message: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    studio_name: string | null;
  };
  studio?: {
    id: number;
    name: string;
    is_active: boolean;
  };
}