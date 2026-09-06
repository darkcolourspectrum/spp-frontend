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
  LessonWithDetails,
  LessonCreate,
  LessonUpdate,
  StudioScheduleResponse,
  TeacherScheduleResponse,
  StudentScheduleResponse,
  GenerateLessonsRequest,
  GenerateLessonsResponse,
  ConflictCheckRequest,
  ConflictCheckResponse,
  ScheduleStudioInfo,
  ScheduleClassroomInfo,
  ScheduleStudioMember,
  ScheduleStudioMembersResponse,
  RecurringPatternPreviewRequest,
  RecurringPatternPreviewResponse,
  RecurringPatternWithGeneration,
  LessonCompleteRequest,
} from './types';

// ==================== RECURRING PATTERNS ====================

/**
 * Предпросмотр шаблона.
 * Считает будущие занятия и конфликты, ничего не создавая.
 */
export const previewRecurringPattern = async (
  data: RecurringPatternPreviewRequest
): Promise<RecurringPatternPreviewResponse> => {
  const response = await apiClient.post(
    '/api/schedule/recurring-patterns/preview',
    data
  );
  return response.data;
};

/**
 * Создать шаблон.
 * Возвращает шаблон вместе с итогом генерации занятий.
 */
export const createRecurringPattern = async (
  data: RecurringPatternCreate
): Promise<RecurringPatternWithGeneration> => {
  const response = await apiClient.post('/api/schedule/recurring-patterns', data);
  return response.data;
};

/**
 * Обновить шаблон.
 * Если менялись слоты или период, будущие занятия пересобираются.
 */
export const updateRecurringPattern = async (
  patternId: number,
  data: RecurringPatternUpdate
): Promise<RecurringPatternWithGeneration> => {
  const response = await apiClient.patch(
    `/api/schedule/recurring-patterns/${patternId}`,
    data
  );
  return response.data;
};

/**
 * Выключить шаблон. Занятия остаются, новые не генерируются.
 */
export const deactivateRecurringPattern = async (
  patternId: number
): Promise<RecurringPatternResponse> => {
  const response = await apiClient.post(
    `/api/schedule/recurring-patterns/${patternId}/deactivate`
  );
  return response.data;
};

/**
 * Удалить шаблон.
 * deleteFutureLessons удаляет и будущие занятия - прошлые не трогаются никогда.
 */
export const deleteRecurringPattern = async (
  patternId: number,
  deleteFutureLessons: boolean = false
): Promise<void> => {
  await apiClient.delete(`/api/schedule/recurring-patterns/${patternId}`, {
    params: { delete_future_lessons: deleteFutureLessons },
  });
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
export const getLessonById = async (lessonId: number): Promise<LessonWithDetails> => {
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
 * Отметить занятие проведённым.
 */
export const completeLesson = async (
  lessonId: number,
  attendance?: LessonCompleteRequest['attendance']
): Promise<LessonResponse> => {
  const body: LessonCompleteRequest = attendance ? { attendance } : {};
  const response = await apiClient.post(
    `/api/schedule/lessons/${lessonId}/complete`,
    body
  );
  return response.data;
};

/**
 * Вернуть отменённое занятие в расписание.
 * Может вернуть 409, если время успели занять.
 */
export const restoreLesson = async (lessonId: number): Promise<LessonResponse> => {
  const response = await apiClient.post(
    `/api/schedule/lessons/${lessonId}/restore`
  );
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
 * Отметить, что занятие сорвалось по вине преподавателя.
 * Ученикам при этом ставится 'cancelled', а не пропуск.
 */
export const markLessonAsTeacherMissed = async (
  lessonId: number
): Promise<LessonResponse> => {
  const response = await apiClient.post(
    `/api/schedule/lessons/${lessonId}/mark-teacher-missed`
  );
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

// ==================== STUDIOS / CLASSROOMS / MEMBERS (read-only) ====================

/**
 * Список студий, доступных текущему пользователю.
 * Источник - локальный кеш Schedule Service (synced from Admin via events).
 */
export const getScheduleStudios = async (): Promise<ScheduleStudioInfo[]> => {
  const response = await apiClient.get('/api/schedule/studios');
  return response.data;
};

/**
 * Активные кабинеты конкретной студии.
 */
export const getScheduleStudioClassrooms = async (
  studioId: number
): Promise<ScheduleClassroomInfo[]> => {
  const response = await apiClient.get(`/api/schedule/studios/${studioId}/classrooms`);
  return response.data;
};

/**
 * Активные преподаватели и ученики конкретной студии.
 * Используется в модалках создания занятия и шаблона.
 */
export const getScheduleStudioMembers = async (
  studioId: number
): Promise<ScheduleStudioMembersResponse> => {
  const response = await apiClient.get(`/api/schedule/studios/${studioId}/members`);
  return response.data;
};

// ==================== EXPORT ====================

export default {
  // Recurring Patterns
  createRecurringPattern,
  previewRecurringPattern,
  deactivateRecurringPattern,
  restoreLesson,
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

  // Studios / Members (read-only)
  getScheduleStudios,
  getScheduleStudioClassrooms,
  getScheduleStudioMembers,
  
  // Generation
  generateLessons,
  checkClassroomConflict,
};