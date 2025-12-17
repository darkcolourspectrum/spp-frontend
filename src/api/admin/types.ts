/**
 * Типы для Admin API
 */

// ==================== USERS ====================

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
  avatar_url: string | null;  // ← ДОБАВЛЕНО
}

// ==================== STUDIOS ====================

export interface Studio {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== CLASSROOMS ====================

export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  description: string | null;
  studio_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ClassroomCreate {
  name: string;
  capacity: number;
  description?: string;
}

export interface ClassroomUpdate {
  name?: string;
  capacity?: number;
  description?: string;
  is_active?: boolean;
}

// ==================== REQUESTS ====================

export interface UpdateRoleRequest {
  role: 'admin' | 'teacher' | 'student' | 'guest';
}

export interface AssignStudioRequest {
  studio_id: number;
}

export interface CreateStudioRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateStudioRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

// ==================== RESPONSES ====================

export interface AdminActionResponse {
  message: string;
  user?: AdminUser;
  studio?: Studio;
}

// ==================== DASHBOARD ====================

export interface SystemStats {
  users: {
    total: number;
    active: number;
    students: number;
    teachers: number;
  };
  studios: {
    total: number;
    active: number;
  };
  classrooms: {
    total: number;
    active: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStudios: number;
  activeTeachers: number;
  activeStudents: number;
  totalClassrooms: number;
  activeClassrooms: number;
}

// УСТАРЕВШИЕ ТИПЫ (для совместимости)
export interface AssignTeacherRequest {
  user_id: number;
  studio_id: number;
}

export interface ChangeRoleRequest {
  user_id: number;
  role: 'admin' | 'teacher' | 'student' | 'guest';
}