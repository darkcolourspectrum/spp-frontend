/**
 * Schedule Service API Client
 */

import apiClient from '../instance';
import type {
  RecurringPatternResponse,
  RecurringPatternCreate,
  RecurringPatternUpdate,
  RecurringPatternListResponse,
  LessonResponse,
  LessonCreate,
  LessonUpdate,
  StudioScheduleResponse,
  TeacherScheduleResponse,
  StudentScheduleResponse,
  GenerateLessonsRequest,
  GenerateLessonsResponse,
  ConflictCheckRequest,
  ConflictCheckResponse,
} from './types';

// ==================== RECURRING PATTERNS ====================

/**
 * Создать шаблон повторяющегося занятия
 */
export const createRecurringPattern = async (
  data: RecurringPatternCreate
): Promise<RecurringPatternResponse> => {
  const response = await apiClient.post('/api/schedule/recurring-patterns', data);
  return response.data;
};

/**
 * Получить список шаблонов
 */
export const getRecurringPatterns = async (
  studioId?: number,
  teacherId?: number,
  activeOnly: boolean = true
): Promise<RecurringPatternListResponse> => {
  const params: any = { active_only: activeOnly };
  if (studioId) params.studio_id = studioId;
  if (teacherId) params.teacher_id = teacherId;
  
  const response = await apiClient.get('/api/schedule/recurring-patterns', { params });
  return response.data;
};

/**
 * Получить шаблон по ID
 */
export const getRecurringPatternById = async (
  patternId: number
): Promise<RecurringPatternResponse> => {
  const response = await apiClient.get(`/api/schedule/recurring-patterns/${patternId}`);
  return response.data;
};

/**
 * Обновить шаблон
 */
export const updateRecurringPattern = async (
  patternId: number,
  data: RecurringPatternUpdate
): Promise<RecurringPatternResponse> => {
  const response = await apiClient.patch(`/api/schedule/recurring-patterns/${patternId}`, data);
  return response.data;
};

/**
 * Удалить шаблон
 */
export const deleteRecurringPattern = async (patternId: number): Promise<void> => {
  await apiClient.delete(`/api/schedule/recurring-patterns/${patternId}`);
};

// ==================== LESSONS ====================

/**
 * Создать разовое занятие
 */
export const createLesson = async (data: LessonCreate): Promise<LessonResponse> => {
  const response = await apiClient.post(`/api/schedule/lessons`, data);
  return response.data;
};

/**
 * Получить занятие по ID
 */
export const getLessonById = async (lessonId: number): Promise<LessonResponse> => {
  const response = await apiClient.get(`/api/schedule/lessons/${lessonId}`);
  return response.data;
};

/**
 * Обновить занятие
 */
export const updateLesson = async (
  lessonId: number,
  data: LessonUpdate
): Promise<LessonResponse> => {
  const response = await apiClient.patch(`/api/schedule/lessons/${lessonId}`, data);
  return response.data;
};

/**
 * Отменить занятие
 */
export const cancelLesson = async (
  lessonId: number,
  reason?: string
): Promise<LessonResponse> => {
  const response = await apiClient.post(`/api/schedule/lessons/${lessonId}/cancel`, { reason });
  return response.data;
};

/**
 * Завершить занятие
 */
export const completeLesson = async (lessonId: number): Promise<LessonResponse> => {
  const response = await apiClient.post(`/api/schedule/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Отметить занятие как пропущенное
 */
export const markLessonAsMissed = async (lessonId: number): Promise<LessonResponse> => {
  const response = await apiClient.post(`/api/schedule/lessons/${lessonId}/mark-missed`);
  return response.data;
};

/**
 * Удалить занятие
 */
export const deleteLesson = async (lessonId: number): Promise<void> => {
  await apiClient.delete(`/api/schedule/lessons/${lessonId}`);
};

// ==================== SCHEDULE ====================

/**
 * Получить расписание студии
 */
export const getStudioSchedule = async (
  studioId: number,
  fromDate: string,
  toDate: string
): Promise<StudioScheduleResponse> => {
  const response = await apiClient.get(`/api/schedule/schedule/studios/${studioId}`, {
    params: { from_date: fromDate, to_date: toDate },
  });
  return response.data;
};

/**
 * Получить расписание преподавателя
 */
export const getTeacherSchedule = async (
  teacherId: number,
  fromDate: string,
  toDate: string
): Promise<TeacherScheduleResponse> => {
  const response = await apiClient.get(`/api/schedule/schedule/teachers/${teacherId}`, {
    params: { from_date: fromDate, to_date: toDate },
  });
  return response.data;
};

/**
 * Получить расписание студента
 */
export const getStudentSchedule = async (
  studentId: number,
  fromDate: string,
  toDate: string
): Promise<StudentScheduleResponse> => {
  const response = await apiClient.get(`/api/schedule/schedule/students/${studentId}`, {
    params: { from_date: fromDate, to_date: toDate },
  });
  return response.data;
};

// ==================== GENERATION ====================

/**
 * Сгенерировать занятия из шаблонов (только для админа)
 */
export const generateLessons = async (
  data: GenerateLessonsRequest
): Promise<GenerateLessonsResponse> => {
  const response = await apiClient.post(`/api/schedule/schedule/generate`, data);
  return response.data;
};

/**
 * Проверить конфликт кабинета
 */
export const checkClassroomConflict = async (
  data: ConflictCheckRequest
): Promise<ConflictCheckResponse> => {
  const response = await apiClient.post(`/api/schedule/schedule/check-conflict`, data);
  return response.data;
};

// ==================== EXPORT ====================

export default {
  // Recurring Patterns
  createRecurringPattern,
  getRecurringPatterns,
  getRecurringPatternById,
  updateRecurringPattern,
  deleteRecurringPattern,
  
  // Lessons
  createLesson,
  getLessonById,
  updateLesson,
  cancelLesson,
  completeLesson,
  markLessonAsMissed,
  deleteLesson,
  
  // Schedule
  getStudioSchedule,
  getTeacherSchedule,
  getStudentSchedule,
  
  // Generation
  generateLessons,
  checkClassroomConflict,
};