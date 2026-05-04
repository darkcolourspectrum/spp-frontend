/**
 * Schedule Reducer - управление состоянием расписания
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  RecurringPatternResponse,
  LessonResponse,
  ScheduleLessonItem,
  ScheduleStudioInfo,
  ScheduleClassroomInfo,
  ScheduleStudioMembersResponse,
} from '@/api/schedule/types';

// ==================== STATE TYPE ====================

export interface ScheduleState {
  // Шаблоны (recurring patterns)
  patterns: RecurringPatternResponse[];
  
  // Занятия (lessons)
  lessons: ScheduleLessonItem[];
  
  // Выбранный шаблон/занятие
  selectedPattern: RecurringPatternResponse | null;
  selectedLesson: LessonResponse | null;
  
  // Фильтры
  filters: {
    studioId: number | null;
    teacherId: number | null;
    studentId: number | null;
    fromDate: string;
    toDate: string;
  };
  
  // Статусы загрузки
  isLoadingPatterns: boolean;
  isLoadingLessons: boolean;
  isLoadingSchedule: boolean;
  isSubmitting: boolean;
  
  // Студии/кабинеты/члены студии из локального кеша Schedule Service.
  // Используются в модалках создания занятий и шаблонов.
  // accessibleStudios - все студии, доступные текущему пользователю.
  accessibleStudios: ScheduleStudioInfo[];
  studioClassrooms: ScheduleClassroomInfo[];
  studioMembers: ScheduleStudioMembersResponse | null;
  isLoadingMembership: boolean;

  // Ошибки
  error: string | null;
  
  // Сообщения
  successMessage: string | null;
  
  // Последнее обновление
  lastUpdated: string | null;
}

// ==================== INITIAL STATE ====================

// Локальная дата без UTC-сдвига. toISOString() даёт UTC, что в часовых
// поясах с положительным offset (например, Asia/Tomsk +07) около полуночи
// возвращает вчерашнюю дату — это ломает выравнивание недели в календаре.
const formatLocal = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Понедельник текущей недели (для дефолтного диапазона календаря Пн-Сб).
const getCurrentWeekMonday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const _monday = getCurrentWeekMonday();
const _saturday = new Date(_monday);
_saturday.setDate(_saturday.getDate() + 5);

const today = formatLocal(_monday);
const nextWeek = formatLocal(_saturday);

const initialState: ScheduleState = {
  patterns: [],
  lessons: [],
  selectedPattern: null,
  selectedLesson: null,
  filters: {
    studioId: null,
    teacherId: null,
    studentId: null,
    fromDate: today,
    toDate: nextWeek,
  },
  isLoadingPatterns: false,
  isLoadingLessons: false,
  isLoadingSchedule: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
  lastUpdated: null,
  accessibleStudios: [],
  studioClassrooms: [],
  studioMembers: null,
  isLoadingMembership: false,
};

// ==================== SLICE ====================

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    // ========== PATTERNS ==========
    
    setPatterns: (state, action: PayloadAction<RecurringPatternResponse[]>) => {
      state.patterns = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    addPattern: (state, action: PayloadAction<RecurringPatternResponse>) => {
      state.patterns.unshift(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    updatePattern: (state, action: PayloadAction<RecurringPatternResponse>) => {
      const index = state.patterns.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patterns[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    removePattern: (state, action: PayloadAction<number>) => {
      state.patterns = state.patterns.filter(p => p.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    setSelectedPattern: (state, action: PayloadAction<RecurringPatternResponse | null>) => {
      state.selectedPattern = action.payload;
    },
    
    // ========== LESSONS ==========
    
    setLessons: (state, action: PayloadAction<ScheduleLessonItem[]>) => {
      state.lessons = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    addLesson: (state, action: PayloadAction<ScheduleLessonItem>) => {
      state.lessons.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    updateLesson: (state, action: PayloadAction<{ lessonId: number; data: Partial<ScheduleLessonItem> }>) => {
      const index = state.lessons.findIndex(l => l.lesson_id === action.payload.lessonId);
      if (index !== -1) {
        state.lessons[index] = { ...state.lessons[index], ...action.payload.data };
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    removeLesson: (state, action: PayloadAction<number>) => {
      state.lessons = state.lessons.filter(l => l.lesson_id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    setSelectedLesson: (state, action: PayloadAction<LessonResponse | null>) => {
      state.selectedLesson = action.payload;
    },
    
    // ========== FILTERS ==========
    
    setStudioFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.studioId = action.payload;
    },
    
    setTeacherFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.teacherId = action.payload;
    },
    
    setStudentFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.studentId = action.payload;
    },
    
    setDateRange: (state, action: PayloadAction<{ fromDate: string; toDate: string }>) => {
      state.filters.fromDate = action.payload.fromDate;
      state.filters.toDate = action.payload.toDate;
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // ========== LOADING STATES ==========
    
    setLoadingPatterns: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPatterns = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setLoadingLessons: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLessons = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setLoadingSchedule: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSchedule = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
      if (action.payload) {
        state.error = null;
        state.successMessage = null;
      }
    },
    
    // ========== MESSAGES ==========
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingPatterns = false;
      state.isLoadingLessons = false;
      state.isLoadingSchedule = false;
      state.isSubmitting = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },
    
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // ========== STUDIOS AND CLASSROOMS FROM CACHE ==========

    setAccessibleStudios: (state, action: PayloadAction<ScheduleStudioInfo[]>) => {
      state.accessibleStudios = action.payload;
    },
    setStudioClassrooms: (state, action: PayloadAction<ScheduleClassroomInfo[]>) => {
      state.studioClassrooms = action.payload;
    },
    setStudioMembers: (
      state,
      action: PayloadAction<ScheduleStudioMembersResponse | null>,
    ) => {
      state.studioMembers = action.payload;
    },
    setLoadingMembership: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMembership = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // ========== CLEAR ==========
    
    clearScheduleData: (state) => {
      state.patterns = [];
      state.lessons = [];
      state.selectedPattern = null;
      state.selectedLesson = null;
      state.error = null;
      state.successMessage = null;
      state.lastUpdated = null;
    },
  },
});

// ==================== EXPORTS ====================

export const {
  setPatterns,
  addPattern,
  updatePattern,
  removePattern,
  setSelectedPattern,
  setLessons,
  addLesson,
  updateLesson,
  removeLesson,
  setSelectedLesson,
  setStudioFilter,
  setTeacherFilter,
  setStudentFilter,
  setDateRange,
  resetFilters,
  setLoadingPatterns,
  setLoadingLessons,
  setLoadingSchedule,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearScheduleData,
  setAccessibleStudios,
  setStudioClassrooms,
  setStudioMembers,
  setLoadingMembership,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;