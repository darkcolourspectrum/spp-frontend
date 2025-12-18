/**
 * Schedule Service API Types
 */

// ==================== RECURRING PATTERN ====================

export interface RecurringPattern {
  id: number;
  studio_id: number;
  teacher_id: number;
  classroom_id: number | null;
  day_of_week: number; // 1=Пн, 2=Вт, ..., 7=Вс
  start_time: string; // "HH:MM"
  duration_minutes: number;
  valid_from: string; // "YYYY-MM-DD"
  valid_until: string | null; // "YYYY-MM-DD" или null
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringPatternResponse extends RecurringPattern {
  student_ids: number[];
  generated_lessons_count: number;
}

export interface RecurringPatternCreate {
  studio_id: number;
  teacher_id: number;
  classroom_id?: number | null;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  valid_from: string;
  valid_until?: string | null;
  student_ids?: number[];
  notes?: string;
}

export interface RecurringPatternUpdate {
  classroom_id?: number | null;
  day_of_week?: number;
  start_time?: string;
  duration_minutes?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  student_ids?: number[];
  notes?: string;
}

export interface RecurringPatternListResponse {
  patterns: RecurringPatternResponse[];
  total: number;
}

// ==================== LESSON ====================

export interface LessonStudentInfo {
  student_id: number;
  attendance_status: 'scheduled' | 'attended' | 'missed' | 'cancelled';
}

export interface Lesson {
  id: number;
  studio_id: number;
  teacher_id: number;
  classroom_id: number | null;
  recurring_pattern_id: number | null;
  lesson_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonResponse extends Lesson {
  students: LessonStudentInfo[];
  is_recurring: boolean;
}

export interface LessonCreate {
  studio_id: number;
  teacher_id: number;
  classroom_id?: number | null;
  lesson_date: string;
  start_time: string;
  end_time: string;
  student_ids?: number[];
  notes?: string;
}

export interface LessonUpdate {
  classroom_id?: number | null;
  lesson_date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
}

// ==================== SCHEDULE ====================

export interface ScheduleLessonItem {
  lesson_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  teacher_id: number;
  teacher_name: string;
  classroom_id: number | null;
  classroom_name: string | null;
  student_ids: number[];
  student_names: string[];
  is_recurring: boolean;
  notes: string | null;
}

export interface StudioScheduleResponse {
  studio_id: number;
  studio_name: string;
  from_date: string;
  to_date: string;
  lessons: ScheduleLessonItem[];
  total: number;
}

export interface TeacherScheduleResponse {
  teacher_id: number;
  teacher_name: string;
  from_date: string;
  to_date: string;
  lessons: ScheduleLessonItem[];
  total: number;
}

export interface StudentScheduleResponse {
  student_id: number;
  student_name: string;
  from_date: string;
  to_date: string;
  lessons: ScheduleLessonItem[];
  total: number;
}

// ==================== GENERATION ====================

export interface GenerateLessonsRequest {
  pattern_id?: number;
  until_date?: string;
}

export interface GenerateLessonsResponse {
  success: boolean;
  generated_count: number;
  skipped_count: number;
  errors: string[];
  message: string;
}

export interface ConflictCheckRequest {
  classroom_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  exclude_lesson_id?: number;
}

export interface ConflictCheckResponse {
  has_conflict: boolean;
  conflicting_lessons: Array<{
    lesson_id: number;
    start_time: string;
    end_time: string;
    teacher_id: number;
  }>;
}

// ==================== FILTERS ====================

export interface ScheduleFilters {
  studio_id?: number;
  teacher_id?: number;
  student_id?: number;
  from_date: string;
  to_date: string;
}

// ==================== DAY OF WEEK ====================

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
};

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

// ==================== STATUS LABELS ====================

export const LESSON_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланировано',
  completed: 'Завершено',
  cancelled: 'Отменено',
  missed: 'Пропущено',
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланировано',
  attended: 'Присутствовал',
  missed: 'Пропустил',
  cancelled: 'Отменено',
};