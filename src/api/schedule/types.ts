/**
 * Schedule Service API Types
 */

// ==================== RECURRING PATTERN ====================

export interface RecurringPatternSlot {
  id: number;
  day_of_week: number; // 1=Пн, 7=Вс
  day_name: string;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM", считается на бекенде
  duration_minutes: number;
  classroom_id: number | null;
}

export interface RecurringPatternSlotCreate {
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  classroom_id?: number | null;
}

export interface RecurringPattern {
  id: number;
  studio_id: number;
  teacher_id: number;
  valid_from: string; // "YYYY-MM-DD"
  valid_until: string | null;
  anchor_date: string; // опорная дата для чётности недель
  week_interval: 1 | 2; // 1 = каждую неделю, 2 = раз в две недели
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringPatternResponse extends RecurringPattern {
  slots: RecurringPatternSlot[];
  student_ids: number[];
  generated_lessons_count: number;
}

export interface RecurringPatternCreate {
  studio_id: number;
  teacher_id: number;
  valid_from: string;
  valid_until?: string | null;
  week_interval: 1 | 2;
  slots: RecurringPatternSlotCreate[];
  student_ids?: number[];
  notes?: string;
}

export interface RecurringPatternUpdate {
  valid_from?: string;
  valid_until?: string | null;
  week_interval?: 1 | 2;
  is_active?: boolean;
  slots?: RecurringPatternSlotCreate[];
  student_ids?: number[];
  notes?: string;
}

export interface RecurringPatternListResponse {
  patterns: RecurringPatternResponse[];
  total: number;
}

// ---------- Предпросмотр и результат генерации ----------

export type ConflictKind = 'classroom' | 'teacher' | 'student';

export interface PreviewConflictItem {
  lesson_date: string;
  start_time: string;
  end_time: string;
  kind: ConflictKind;
  subject_id: number; // id кабинета, преподавателя или ученика
  classroom_id: number | null;
  message: string;
}

export interface RecurringPatternPreviewRequest extends RecurringPatternCreate {
  /** ID редактируемого шаблона: его занятия не считаются конфликтом */
  pattern_id?: number;
}

export interface RecurringPatternPreviewResponse {
  will_create_count: number;
  already_exists_count: number;
  blocked_count: number;
  /** Край горизонта генерации. Занятия создаются только до этой даты */
  horizon_end: string;
  dates: string[];
  conflicts: PreviewConflictItem[];
}

export interface PatternGenerationSummary {
  created_count: number;
  already_existed_count: number;
  blocked_count: number;
  /** ID прогона генерации, по нему возможен откат */
  batch_id: string | null;
  conflicts: PreviewConflictItem[];
}

export interface RecurringPatternWithGeneration {
  pattern: RecurringPatternResponse;
  generation: PatternGenerationSummary;
}

export const WEEK_INTERVAL_LABELS: Record<number, string> = {
  1: 'Каждую неделю',
  2: 'Раз в две недели',
};

export const CONFLICT_KIND_LABELS: Record<ConflictKind, string> = {
  classroom: 'Кабинет',
  teacher: 'Преподаватель',
  student: 'Ученик',
};

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
  duration_minutes: number;
  student_ids?: number[];
  notes?: string;
}

export interface LessonUpdate {
  classroom_id?: number | null;
  lesson_date?: string;
  start_time?: string;
  duration_minutes?: number;
  notes?: string;
}

export interface LessonCancelRequest {
  reason?: string;
}

export type AttendanceStatus = 'attended' | 'missed';

export interface LessonCompleteRequest {
  /** Посещаемость поимённо. Не передана - все считаются присутствовавшими */
  attendance?: Record<number, AttendanceStatus>;
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

// ==================== STUDIOS / CLASSROOMS / MEMBERS (read-only кеши) ====================

export interface ScheduleStudioInfo {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  teachers_count: number;
  students_count: number;
  classrooms_count: number;
}

export interface ScheduleClassroomInfo {
  id: number;
  studio_id: number;
  name: string;
  capacity: number;
  description: string | null;
  floor: number | null;
  room_number: string | null;
  is_active: boolean;
}

export interface ScheduleStudioMember {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  role: 'teacher' | 'student';
  studio_id: number | null;
  is_active: boolean;
}

export interface ScheduleStudioMembersResponse {
  studio_id: number;
  teachers: ScheduleStudioMember[];
  students: ScheduleStudioMember[];
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

/**
 * Рабочие дни студии, ISO: 1=Пн ... 6=Сб.
 * Должно совпадать с SCHEDULE_WORKING_DAYS на бекенде.
 */
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6];

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