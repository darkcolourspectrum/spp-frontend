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
  teachers_count: number;
  students_count: number;
  created_at: string;
}

// ==================== REQUESTS ====================

export interface AssignTeacherRequest {
  user_id: number;
  studio_id: number;
}

export interface ChangeRoleRequest {
  user_id: number;
  role: 'admin' | 'teacher' | 'student' | 'guest';
}

export interface AssignStudioRequest {
  user_id: number;
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

// ==================== DASHBOARD ====================

// Системная статистика (ответ от бэкенда)
export interface SystemStats {
  users: {
    total_students: number;
    total_teachers: number;
    total_users: number;
  };
  profiles: {
    total_profiles: number;
    public_profiles: number;
    private_profiles: number;
  };
  content: {
    total_comments: number;
    total_activities: number;
  };
}

// Статистика для UI (то что храним в Redux)
export interface DashboardStats {
  totalUsers: number;
  totalStudios: number;
  activeTeachers: number;
  activeStudents: number;
  totalComments: number;
  totalActivities: number;
}