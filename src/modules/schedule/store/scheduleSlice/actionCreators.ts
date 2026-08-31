/**
 * Schedule Action Creators - async операции (thunks)
 */

import { AppDispatch, RootState } from '@/store';
import * as scheduleApi from '@/api/schedule';
import type {
  RecurringPatternCreate,
  RecurringPatternUpdate,
  LessonCreate,
  LessonUpdate,
  GenerateLessonsRequest,
  RecurringPatternPreviewRequest,
  AttendanceStatus,
} from '@/api/schedule/types';
import {
  setPatterns,
  addPattern,
  updatePattern as updatePatternAction,
  removePattern,
  setLessons,
  setLoadingPatterns,
  setLoadingSchedule,
  setSubmitting,
  setError,
  setSuccessMessage,
} from './scheduleReducer';

/**
 * Перечитать текущее расписание после мутации.
 *
 * Раньше каждая мутация решала это по-своему: отмена и перенос вручную
 * диспатчили fetchStudioSchedule, а создание занятия не делало ничего -
 * занятие появлялось в базе, но не на экране до нажатия "Обновить".
 *
 * Контекст берётся из filters, поэтому один и тот же вызов работает
 * на экране студии, преподавателя и ученика.
 */
export const refreshCurrentSchedule = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { studioId, teacherId, studentId, fromDate, toDate } =
      getState().schedule.filters;

    if (studioId) {
      return dispatch(fetchStudioSchedule(studioId, fromDate, toDate));
    }
    if (teacherId) {
      return dispatch(fetchTeacherSchedule(teacherId, fromDate, toDate));
    }
    if (studentId) {
      return dispatch(fetchStudentSchedule(studentId, fromDate, toDate));
    }
  };
};

/**
 * Предпросмотр шаблона. В стор ничего не пишет - результат возвращается
 * вызывающей форме, она держит его в локальном состоянии.
 */
export const previewRecurringPattern = (data: RecurringPatternPreviewRequest) => {
  return async (dispatch: AppDispatch) => {
    try {
      return await scheduleApi.previewRecurringPattern(data);
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Не удалось рассчитать предпросмотр';
      dispatch(setError(message));
      throw error;
    }
  };
};

// ==================== RECURRING PATTERNS ====================

/**
 * Загрузить список шаблонов
 */
export const fetchRecurringPatterns = (
  studioId?: number,
  teacherId?: number,
  activeOnly: boolean = true
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoadingPatterns(true));
      
      const response = await scheduleApi.getRecurringPatterns(studioId, teacherId, activeOnly);
      
      dispatch(setPatterns(response.patterns));
    } catch (error: any) {
      console.error('Failed to fetch recurring patterns:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось загрузить шаблоны';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoadingPatterns(false));
    }
  };
};

//create pattern
export const createRecurringPattern = (data: RecurringPatternCreate) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));

      const result = await scheduleApi.createRecurringPattern(data);

      dispatch(addPattern(result.pattern));
      dispatch(
        setSuccessMessage(
          `Шаблон создан, занятий добавлено: ${result.generation.created_count}`
        )
      );
      await dispatch(refreshCurrentSchedule());

      return result;
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Не удалось создать шаблон';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

//update pattern
export const updateRecurringPattern = (
  patternId: number,
  data: RecurringPatternUpdate
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));

      const result = await scheduleApi.updateRecurringPattern(patternId, data);

      dispatch(updatePatternAction(result.pattern));
      dispatch(setSuccessMessage('Шаблон обновлён'));
      await dispatch(refreshCurrentSchedule());

      return result;
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Не удалось обновить шаблон';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

//delete pattern
export const deleteRecurringPattern = (
  patternId: number,
  deleteFutureLessons: boolean = false
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));

      await scheduleApi.deleteRecurringPattern(patternId, deleteFutureLessons);

      dispatch(removePattern(patternId));
      dispatch(setSuccessMessage('Шаблон удалён'));
      await dispatch(refreshCurrentSchedule());
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Не удалось удалить шаблон';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

// ==================== LESSONS ====================

/**
 * Создать разовое занятие
 */
export const createLesson = (data: LessonCreate) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      const newLesson = await scheduleApi.createLesson(data);
      
      // Преобразуем LessonResponse в ScheduleLessonItem
      // TODO: может потребоваться дополнительная обработка
      
      dispatch(setSuccessMessage('Занятие успешно создано'));
      
      await dispatch(refreshCurrentSchedule());

      return newLesson;
    } catch (error: any) {
      console.error('Failed to create lesson:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось создать занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Обновить занятие
 */
export const updateLesson = (lessonId: number, data: LessonUpdate) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      const updatedLesson = await scheduleApi.updateLesson(lessonId, data);
      
      dispatch(setSuccessMessage('Занятие успешно обновлено'));
      
      await dispatch(refreshCurrentSchedule());

      return updatedLesson;
    } catch (error: any) {
      console.error('Failed to update lesson:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось обновить занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Отменить занятие
 */
export const cancelLesson = (lessonId: number, reason?: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      await scheduleApi.cancelLesson(lessonId, reason);
      
      dispatch(setSuccessMessage('Занятие отменено'));
      await dispatch(refreshCurrentSchedule());
    } catch (error: any) {
      console.error('Failed to cancel lesson:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось отменить занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Завершить занятие
 */
export const completeLesson = (lessonId: number, attendance?: Record<number, AttendanceStatus>) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      await scheduleApi.completeLesson(lessonId, attendance);
      await dispatch(refreshCurrentSchedule());

      dispatch(setSuccessMessage('Занятие завершено'));
    } catch (error: any) {
      console.error('Failed to complete lesson:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось завершить занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Отметить занятие как пропущенное
 */
export const markLessonAsMissed = (lessonId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      await scheduleApi.markLessonAsMissed(lessonId);
      
      dispatch(setSuccessMessage('Занятие отмечено как пропущенное'));
    } catch (error: any) {
      console.error('Failed to mark lesson as missed:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось отметить занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Вернуть отменённое занятие в расписание.
 * Бекенд проверит конфликты заново и вернёт 409, если слот занят.
 */
export const restoreLesson = (lessonId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));

      const lesson = await scheduleApi.restoreLesson(lessonId);

      dispatch(setSuccessMessage('Занятие возвращено в расписание'));
      await dispatch(refreshCurrentSchedule());

      return lesson;
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Не удалось вернуть занятие';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

/**
 * Удалить занятие
 */
export const deleteLesson = (lessonId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      await scheduleApi.deleteLesson(lessonId);
      
      dispatch(setSuccessMessage('Занятие удалено'));
    } catch (error: any) {
      console.error('Failed to delete lesson:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось удалить занятие';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};

// ==================== SCHEDULE ====================

/**
 * Загрузить расписание студии
 */
export const fetchStudioSchedule = (
  studioId: number,
  fromDate: string,
  toDate: string
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoadingSchedule(true));
      
      const response = await scheduleApi.getStudioSchedule(studioId, fromDate, toDate);
      
      dispatch(setLessons(response.lessons));
    } catch (error: any) {
      console.error('Failed to fetch studio schedule:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось загрузить расписание';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoadingSchedule(false));
    }
  };
};

/**
 * Загрузить расписание преподавателя
 */
export const fetchTeacherSchedule = (
  teacherId: number,
  fromDate: string,
  toDate: string
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoadingSchedule(true));
      
      const response = await scheduleApi.getTeacherSchedule(teacherId, fromDate, toDate);
      
      dispatch(setLessons(response.lessons));
    } catch (error: any) {
      console.error('Failed to fetch teacher schedule:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось загрузить расписание';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoadingSchedule(false));
    }
  };
};

/**
 * Загрузить расписание студента
 */
export const fetchStudentSchedule = (
  studentId: number,
  fromDate: string,
  toDate: string
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoadingSchedule(true));
      
      const response = await scheduleApi.getStudentSchedule(studentId, fromDate, toDate);
      
      dispatch(setLessons(response.lessons));
    } catch (error: any) {
      console.error('Failed to fetch student schedule:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось загрузить расписание';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoadingSchedule(false));
    }
  };
};

// ==================== GENERATION ====================

/**
 * Сгенерировать занятия из шаблонов (только для админа)
 */
export const generateLessons = (data: GenerateLessonsRequest) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setSubmitting(true));
      
      const response = await scheduleApi.generateLessons(data);
      
      dispatch(setSuccessMessage(response.message));
      
      return response;
    } catch (error: any) {
      console.error('Failed to generate lessons:', error);
      const errorMessage = error.response?.data?.detail || 'Не удалось сгенерировать занятия';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setSubmitting(false));
    }
  };
};