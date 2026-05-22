/**
 * API-функции для CRM Service.
 *
 * Все запросы идут через api-gateway: путь /api/crm/... проксируется
 * на crm-service. Публичная ручка создания заявки (/leads/public) здесь
 * НЕ представлена - она дёргается напрямую (форма лендинга), а не из
 * админского UI.
 */

import apiClient from '../instance';
import type {
  Lead,
  LeadDetail,
  LeadListResponse,
  LeadListParams,
  LeadConversionResponse,
  LeadStatusUpdateRequest,
  LeadUpdateRequest,
  LeadActivity,
  LeadActivityCreateRequest,
  LeadConvertRequest,
  StudioOption,
} from './types';

// Endpoints
const CRM_ENDPOINTS = {
  LEADS: '/api/crm/leads',
  LEAD_BY_ID: (id: number) => `/api/crm/leads/${id}`,
  LEAD_STATUS: (id: number) => `/api/crm/leads/${id}/status`,
  LEAD_ACTIVITIES: (id: number) => `/api/crm/leads/${id}/activities`,
  LEAD_CONVERT: (id: number) => `/api/crm/leads/${id}/convert-to-user`,
  STUDIOS: '/api/crm/studios',
};

// ==================== ЛИДЫ ====================

/** Получить список лидов с фильтрами и пагинацией. */
export const getLeads = async (
  params?: LeadListParams,
): Promise<LeadListResponse> => {
  const response = await apiClient.get<LeadListResponse>(
    CRM_ENDPOINTS.LEADS,
    { params },
  );
  return response.data;
};

/** Получить карточку лида с журналом активностей. */
export const getLeadById = async (id: number): Promise<LeadDetail> => {
  const response = await apiClient.get<LeadDetail>(
    CRM_ENDPOINTS.LEAD_BY_ID(id),
  );
  return response.data;
};

/** Сменить статус лида (перемещение по воронке). */
export const updateLeadStatus = async (
  id: number,
  data: LeadStatusUpdateRequest,
): Promise<Lead> => {
  const response = await apiClient.patch<Lead>(
    CRM_ENDPOINTS.LEAD_STATUS(id),
    data,
  );
  return response.data;
};

/** Обновить поля лида (notes, email, phone). */
export const updateLead = async (
  id: number,
  data: LeadUpdateRequest,
): Promise<Lead> => {
  const response = await apiClient.patch<Lead>(
    CRM_ENDPOINTS.LEAD_BY_ID(id),
    data,
  );
  return response.data;
};

/** Добавить запись (заметку или звонок) в журнал лида. */
export const addLeadActivity = async (
  id: number,
  data: LeadActivityCreateRequest,
): Promise<LeadActivity> => {
  const response = await apiClient.post<LeadActivity>(
    CRM_ENDPOINTS.LEAD_ACTIVITIES(id),
    data,
  );
  return response.data;
};

/** Конвертировать лид в клиента (создать пользователя в Auth Service). */
export const convertLeadToUser = async (
  id: number,
  data?: LeadConvertRequest,
): Promise<LeadConversionResponse> => {
  const response = await apiClient.post<LeadConversionResponse>(
    CRM_ENDPOINTS.LEAD_CONVERT(id),
    data,
  );
  return response.data;
};

// ==================== СПРАВОЧНИКИ ====================

/** Получить список активных студий из локального кеша CRM. */
export const getStudios = async (): Promise<StudioOption[]> => {
  const response = await apiClient.get<StudioOption[]>(
    CRM_ENDPOINTS.STUDIOS,
  );
  return response.data;
};

// Реэкспорт типов для удобного импорта из одного места.
export type * from './types';