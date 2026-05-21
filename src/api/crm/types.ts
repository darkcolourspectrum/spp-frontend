/**
 * TypeScript-типы для CRM Service API.
 *
 * Зеркало Pydantic-схем бэкенда (services/crm_service/app/schemas/lead.py).
 * При изменении схем на бэке - синхронизировать здесь.
 */

// ==================== ENUM-ТИПЫ ====================

/** Статус лида в воронке продаж. */
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'trial_scheduled'
  | 'trial_attended'
  | 'converted'
  | 'lost';

/** Источник заявки. */
export type LeadSource = 'landing' | 'instagram' | 'referral' | 'manual';

/** Тип записи в журнале активностей лида. */
export type LeadActivityType = 'note' | 'call' | 'status_changed';

// ==================== СУЩНОСТИ ====================

/** Запись журнала активностей лида. */
export interface LeadActivity {
  id: number;
  lead_id: number;
  type: LeadActivityType;
  content: string;
  created_by: number | null;
  created_at: string;
}

/** Лид - карточка без журнала активностей. */
export interface Lead {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  studio_id: number | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  notes: string | null;
  lost_reason: string | null;
  converted_user_id: number | null;
  created_at: string;
  updated_at: string;
}

/** Полная карточка лида с лентой истории. */
export interface LeadDetail extends Lead {
  activities: LeadActivity[];
}

/** Страница списка лидов. */
export interface LeadListResponse {
  total: number;
  items: Lead[];
}

/** Результат конвертации лида в клиента. */
export interface LeadConversionResponse {
  converted_user_id: number;
  lead: Lead;
}

// ==================== ЗАПРОСЫ ====================

/** Параметры запроса списка лидов. */
export interface LeadListParams {
  status?: LeadStatus;
  assigned_to?: number;
  limit?: number;
  offset?: number;
}

/** Тело смены статуса лида. */
export interface LeadStatusUpdateRequest {
  status: LeadStatus;
  /** Обязательно при status='lost', запрещено при остальных. */
  lost_reason?: string;
  /** Необязательный комментарий к смене статуса. */
  comment?: string;
}

/** Тело правки полей лида. */
export interface LeadUpdateRequest {
  assigned_to?: number | null;
  notes?: string | null;
  email?: string;
  phone?: string | null;
}

/** Тело добавления записи в журнал. Тип status_changed недопустим. */
export interface LeadActivityCreateRequest {
  type: 'note' | 'call';
  content: string;
}