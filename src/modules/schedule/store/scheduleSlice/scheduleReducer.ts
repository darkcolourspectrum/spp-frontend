/**
 * Schedule Reducer - управление состоянием расписания
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  RecurringPatternResponse,
  LessonResponse,
  ScheduleLessonItem,
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
  
  // Ошибки
  error: string | null;
  
  // Сообщения
  successMessage: string | null;
  
  // Последнее обновление
  lastUpdated: string | null;
}

// ==================== INITIAL STATE ====================

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
} = scheduleSlice.actions;

export default scheduleSlice.reducer;