/**
 * CRM Action Creators (Thunks).
 *
 * Асинхронные действия с лидами. После каждого изменения store
 * обновляется локально (updateLeadInList) - доска перерисовывается
 * без перезагрузки страницы.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as crmApi from '@/api/crm';
import type {
  Lead,
  LeadStatusUpdateRequest,
  LeadUpdateRequest,
  LeadActivityCreateRequest,
  LeadListParams,
  LeadConvertRequest,
} from '@/api/crm/types';
import {
  setLeads,
  updateLeadInList,
  patchSelectedLeadFromLead,
  setSelectedLead,
  setLoadingLeads,
  setLoadingLead,
  setSubmitting,
  setError,
  setSuccessMessage,
} from './crmReducer';

// Хелпер обработки ошибок (как в admin-модуле).
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || 'Произошла ошибка';
};

// ==================== ЗАГРУЗКА ====================

/** Загрузить список лидов для доски. */
export const fetchLeads = createAsyncThunk(
  'crm/fetchLeads',
  async (params: LeadListParams | undefined, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingLeads(true));
      // limit задаётся с запасом: доска показывает все лиды сразу,
      // постраничности у канбана нет.
      const response = await crmApi.getLeads({ limit: 100, ...params });
      dispatch(setLeads(response.items));
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoadingLeads(false));
    }
  },
);

/** Загрузить карточку лида с журналом активностей (для модалки). */
export const fetchLeadDetail = createAsyncThunk(
  'crm/fetchLeadDetail',
  async (leadId: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoadingLead(true));
      const lead = await crmApi.getLeadById(leadId);
      dispatch(setSelectedLead(lead));
      return lead;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoadingLead(false));
    }
  },
);

// ==================== СМЕНА СТАТУСА ====================

/**
 * Сменить статус лида (drag-and-drop или выбор в карточке).
 *
 * Оптимистичный апдейт: вызывающий код (доска) сразу перемещает
 * карточку в новую колонку. Этот thunk шлёт запрос на сервер; при
 * ошибке возвращает прежний статус через previousLead, чтобы доска
 * могла откатить карточку назад.
 */
export const changeLeadStatus = createAsyncThunk(
  'crm/changeLeadStatus',
  async (
    args: {
      leadId: number;
      data: LeadStatusUpdateRequest;
      /** Лид до изменения - для отката при ошибке. */
      previousLead: Lead;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const updated = await crmApi.updateLeadStatus(args.leadId, args.data);
      dispatch(updateLeadInList(updated));
      dispatch(patchSelectedLeadFromLead(updated));
      dispatch(setSuccessMessage('Статус лида обновлён'));
      return updated;
    } catch (error) {
      const message = getErrorMessage(error);
      // Откат: возвращаем карточку в прежнее состояние.
      dispatch(updateLeadInList(args.previousLead));
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

// ==================== ПРАВКА ЛИДА ====================

/** Обновить поля лида (notes, email, phone). */
export const updateLeadFields = createAsyncThunk(
  'crm/updateLeadFields',
  async (
    args: { leadId: number; data: LeadUpdateRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSubmitting(true));
      const updated = await crmApi.updateLead(args.leadId, args.data);
      dispatch(updateLeadInList(updated));
      dispatch(patchSelectedLeadFromLead(updated));
      dispatch(setSuccessMessage('Лид обновлён'));
      return updated;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSubmitting(false));
    }
  },
);

// ==================== ЖУРНАЛ АКТИВНОСТЕЙ ====================

/**
 * Добавить запись в журнал лида.
 *
 * После добавления перезагружает карточку лида (fetchLeadDetail),
 * чтобы лента активностей в модалке обновилась.
 */
export const addActivity = createAsyncThunk(
  'crm/addActivity',
  async (
    args: { leadId: number; data: LeadActivityCreateRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSubmitting(true));
      const activity = await crmApi.addLeadActivity(args.leadId, args.data);
      dispatch(setSuccessMessage('Запись добавлена в журнал'));
      // Перечитываем карточку - лента истории обновится.
      await dispatch(fetchLeadDetail(args.leadId));
      return activity;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSubmitting(false));
    }
  },
);

// ==================== КОНВЕРТАЦИЯ ====================

/** Конвертировать лид в клиента (создать пользователя). */
export const convertLead = createAsyncThunk(
  'crm/convertLead',
  async (
    args: { leadId: number; data?: LeadConvertRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSubmitting(true));
      const result = await crmApi.convertLeadToUser(args.leadId, args.data);
      // Лид сменил статус на trial_scheduled - обновляем в списке.
      dispatch(updateLeadInList(result.lead));
      dispatch(
        setSuccessMessage(
          `Лид конвертирован в клиента (ID пользователя: ${result.converted_user_id})`,
        ),
      );
      // Перечитываем карточку, если она открыта в модалке.
      await dispatch(fetchLeadDetail(args.leadId));
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSubmitting(false));
    }
  },
);