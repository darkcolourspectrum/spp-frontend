/**
 * Async actions для membership-данных в Schedule Service.
 * 
 * Источник - локальный кеш Schedule Service (синхронизируется из Admin
 * и Auth сервисов через события). Используется модалками создания
 * занятий и шаблонов вместо admin-эндпоинтов.
 */

import type { Dispatch } from '@reduxjs/toolkit';
import {
  getScheduleStudios,
  getScheduleStudioClassrooms,
  getScheduleStudioMembers,
} from '@/api/schedule';
import {
  setAccessibleStudios,
  setStudioClassrooms,
  setStudioMembers,
  setLoadingMembership,
  setError,
} from './scheduleReducer';

/**
 * Загрузить список студий, доступных текущему пользователю.
 */
export const fetchAccessibleStudios = () => async (dispatch: Dispatch) => {
  dispatch(setLoadingMembership(true));
  try {
    const studios = await getScheduleStudios();
    dispatch(setAccessibleStudios(studios));
  } catch (err: any) {
    const message =
      err?.response?.data?.detail || err?.message || 'Failed to load studios';
    dispatch(setError(message));
  } finally {
    dispatch(setLoadingMembership(false));
  }
};

/**
 * Загрузить активные кабинеты студии.
 */
export const fetchStudioClassroomsForSchedule =
  (studioId: number) => async (dispatch: Dispatch) => {
    dispatch(setLoadingMembership(true));
    try {
      const classrooms = await getScheduleStudioClassrooms(studioId);
      dispatch(setStudioClassrooms(classrooms));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Failed to load classrooms';
      dispatch(setError(message));
    } finally {
      dispatch(setLoadingMembership(false));
    }
  };

/**
 * Загрузить преподавателей и учеников студии.
 */
export const fetchStudioMembers =
  (studioId: number) => async (dispatch: Dispatch) => {
    dispatch(setLoadingMembership(true));
    try {
      const members = await getScheduleStudioMembers(studioId);
      dispatch(setStudioMembers(members));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Failed to load members';
      dispatch(setError(message));
    } finally {
      dispatch(setLoadingMembership(false));
    }
  };