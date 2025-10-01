/**
 * Типы для Profile Service API
 */

// ==================== PROFILE TYPES ====================

export interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  role: string;
  studio_id: number | null;
  studio_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

// ==================== AVATAR TYPES ====================

export interface AvatarUploadResponse {
  avatar_url: string;
  message: string;
}

export interface AvatarDeleteResponse {
  message: string;
}

// ==================== DASHBOARD TYPES ====================

export interface RecentActivity {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface UpcomingLesson {
  lesson_id: number;
  title: string;
  lesson_type: string;
  start_time: string;
  end_time: string;
  teacher_name: string;
  room_name: string | null;
  status: string;
}

export interface ProfileStats {
  total_lessons: number;
  completed_lessons: number;
  upcoming_lessons: number;
  cancelled_lessons: number;
  total_comments: number;
}

export interface DashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
  stats: ProfileStats;
  recent_activities: RecentActivity[];
  upcoming_lessons: UpcomingLesson[];
  last_updated: string;
}

// ==================== COMMENT TYPES (для будущего) ====================

export interface Comment {
  id: number;
  profile_id: number;
  author_id: number;
  author_name: string;
  content: string;
  rating: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreateRequest {
  content: string;
  rating?: number;
}

export interface CommentUpdateRequest {
  content?: string;
  rating?: number;
}

// ==================== ACTIVITY TYPES ====================

export interface ActivityFilter {
  activity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityListResponse {
  activities: RecentActivity[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== ERROR TYPES ====================

export interface ProfileApiError {
  detail: string;
  status_code?: number;
}

export interface ProfileValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}