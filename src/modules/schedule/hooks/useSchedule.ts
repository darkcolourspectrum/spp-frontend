/**
 * useSchedule Hook - удобный доступ к schedule state и actions
 */

import { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchRecurringPatterns,
  createRecurringPattern,
  updateRecurringPattern,
  deleteRecurringPattern,
  fetchStudioSchedule,
  fetchTeacherSchedule,
  fetchStudentSchedule,
  createLesson,
  updateLessonThunk,
  cancelLesson,
  completeLesson,
  markLessonAsMissed,
  deleteLesson,
  generateLessons,
  clearError,
  clearSuccessMessage,
  setDateRange,
} from '../store';
import type {
  RecurringPatternCreate,
  RecurringPatternUpdate,
  LessonCreate,
  LessonUpdate,
  GenerateLessonsRequest,
} from '@/api/schedule/types';

export const useSchedule = () => {
  const dispatch = useAppDispatch();
  
  // Селекторы
  const {
    patterns,
    lessons,
    selectedPattern,
    selectedLesson,
    filters,
    isLoadingPatterns,
    isLoadingLessons,
    isLoadingSchedule,
    isSubmitting,
    error,
    successMessage,
    lastUpdated,
  } = useAppSelector((state) => state.schedule);
  
  // ==================== RECURRING PATTERNS ====================
  
  const loadRecurringPatterns = useCallback(
    (studioId?: number, teacherId?: number, activeOnly: boolean = true) => {
      return dispatch(fetchRecurringPatterns(studioId, teacherId, activeOnly));
    },
    [dispatch]
  );
  
  const addRecurringPattern = useCallback(
    (data: RecurringPatternCreate) => {
      return dispatch(createRecurringPattern(data));
    },
    [dispatch]
  );
  
  const editRecurringPattern = useCallback(
    (patternId: number, data: RecurringPatternUpdate) => {
      return dispatch(updateRecurringPattern(patternId, data));
    },
    [dispatch]
  );
  
  const removeRecurringPattern = useCallback(
    (patternId: number) => {
      return dispatch(deleteRecurringPattern(patternId));
    },
    [dispatch]
  );
  
  // ==================== LESSONS ====================
  
  const addLesson = useCallback(
    (data: LessonCreate) => {
      return dispatch(createLesson(data));
    },
    [dispatch]
  );
  
  const editLesson = useCallback(
    (lessonId: number, data: LessonUpdate) => {
      return dispatch(updateLessonThunk(lessonId, data));
    },
    [dispatch]
  );
  
  const handleCancelLesson = useCallback(
    (lessonId: number, reason?: string) => {
      return dispatch(cancelLesson(lessonId, reason));
    },
    [dispatch]
  );
  
  const handleCompleteLesson = useCallback(
    (lessonId: number) => {
      return dispatch(completeLesson(lessonId));
    },
    [dispatch]
  );
  
  const handleMarkLessonAsMissed = useCallback(
    (lessonId: number) => {
      return dispatch(markLessonAsMissed(lessonId));
    },
    [dispatch]
  );
  
  const removeLesson = useCallback(
    (lessonId: number) => {
      return dispatch(deleteLesson(lessonId));
    },
    [dispatch]
  );
  
  // ==================== SCHEDULE ====================
  
  const loadStudioSchedule = useCallback(
    (studioId: number, fromDate: string, toDate: string) => {
      return dispatch(fetchStudioSchedule(studioId, fromDate, toDate));
    },
    [dispatch]
  );
  
  const loadTeacherSchedule = useCallback(
    (teacherId: number, fromDate: string, toDate: string) => {
      return dispatch(fetchTeacherSchedule(teacherId, fromDate, toDate));
    },
    [dispatch]
  );
  
  const loadStudentSchedule = useCallback(
    (studentId: number, fromDate: string, toDate: string) => {
      return dispatch(fetchStudentSchedule(studentId, fromDate, toDate));
    },
    [dispatch]
  );
  
  const handleGenerateLessons = useCallback(
    (data: GenerateLessonsRequest) => {
      return dispatch(generateLessons(data));
    },
    [dispatch]
  );
  
  // ==================== DATE RANGE ====================
  
  const updateDateRange = useCallback(
    (fromDate: string, toDate: string) => {
      dispatch(setDateRange({ fromDate, toDate }));
    },
    [dispatch]
  );
  
  // ==================== MESSAGES ====================
  
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  const handleClearSuccess = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);
  
  // ==================== COMPUTED VALUES ====================
  
  // Группировка занятий по датам
  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, typeof lessons> = {};
    
    lessons.forEach((lesson) => {
      if (!grouped[lesson.lesson_date]) {
        grouped[lesson.lesson_date] = [];
      }
      grouped[lesson.lesson_date].push(lesson);
    });
    
    // Сортируем занятия внутри каждой даты по времени
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    
    return grouped;
  }, [lessons]);
  
  // Активные шаблоны
  const activePatterns = useMemo(() => {
    return patterns.filter((p) => p.is_active);
  }, [patterns]);
  
  // Количество занятий по статусам
  const lessonStats = useMemo(() => {
    const stats = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      missed: 0,
    };
    
    lessons.forEach((lesson) => {
      stats[lesson.status]++;
    });
    
    return stats;
  }, [lessons]);
  
  return {
    // State
    patterns,
    lessons,
    selectedPattern,
    selectedLesson,
    filters,
    isLoadingPatterns,
    isLoadingLessons,
    isLoadingSchedule,
    isSubmitting,
    error,
    successMessage,
    lastUpdated,
    
    // Computed
    lessonsByDate,
    activePatterns,
    lessonStats,
    
    // Actions - Patterns
    loadRecurringPatterns,
    addRecurringPattern,
    editRecurringPattern,
    removeRecurringPattern,
    
    // Actions - Lessons
    addLesson,
    editLesson,
    handleCancelLesson,
    handleCompleteLesson,
    handleMarkLessonAsMissed,
    removeLesson,
    
    // Actions - Schedule
    loadStudioSchedule,
    loadTeacherSchedule,
    loadStudentSchedule,
    handleGenerateLessons,
    
    // Actions - Other
    updateDateRange,
    handleClearError,
    handleClearSuccess,
  };
};