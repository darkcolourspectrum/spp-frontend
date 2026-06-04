/**
 * API-функции и типы аналитического дашборда администратора.
 *
 * Запрос идёт через api-gateway: путь /api/admin/dashboard/analytics
 * проксируется на admin-service (/api/v1/dashboard/analytics).
 *
 * Все агрегаты считаются на бэке - фронт только отображает. Доли (rate)
 * приходят как доли [0..1]; перевод в проценты - на стороне фронта.
 *
 * Типы зеркалят Pydantic-схемы admin_service/app/schemas/analytics.py.
 */

import apiClient from '../instance';

// ==================== ПЕРИОД ====================

/** Допустимые быстрые пресеты периода (дни). */
export type AnalyticsPreset = 7 | 30 | 90;

export interface AnalyticsPeriod {
  date_from: string; // ISO date YYYY-MM-DD
  date_to: string;
  days: number;
}

// ==================== ОБЩИЕ ТОЧКИ РЯДОВ ====================

export interface DailyPoint {
  day: string; // ISO date
  count: number;
}

export interface LessonDailyPoint {
  day: string;
  total: number;
  cancelled: number;
}

// ==================== ВОРОНКА ЛИДОВ ====================

export interface FunnelStage {
  status: string;
  count: number;
}

export interface SourceBreakdownItem {
  source: string;
  total: number;
  converted: number;
  conversion_rate: number; // [0..1]
}

export interface LostReasonItem {
  reason: string | null; // null = причина не указана
  count: number;
}

export interface LeadsAnalytics {
  total_created: number;
  total_converted: number;
  overall_conversion_rate: number; // [0..1]
  avg_time_to_conversion_hours: number | null;
  funnel: FunnelStage[];
  by_source: SourceBreakdownItem[];
  lost_reasons: LostReasonItem[];
  created_daily: DailyPoint[];
  conversions_daily: DailyPoint[];
}

// ==================== ОПЕРАЦИОНКА РАСПИСАНИЯ ====================

export interface TeacherLoadItem {
  teacher_id: number;
  teacher_name: string | null;
  total: number;
  cancelled: number;
}

export interface LessonsAnalytics {
  total: number;
  cancelled: number;
  rescheduled: number;
  cancellation_rate: number; // [0..1]
  by_teacher: TeacherLoadItem[];
  lessons_daily: LessonDailyPoint[];
}

// ==================== КОРНЕВОЙ ОТВЕТ ====================

export interface AnalyticsDashboardResponse {
  period: AnalyticsPeriod;
  leads: LeadsAnalytics;
  lessons: LessonsAnalytics;
  data_complete: boolean;
}

// ==================== ENDPOINT ====================

const ANALYTICS_ENDPOINT = '/api/admin/dashboard/analytics';

/**
 * Параметры запроса аналитики. Либо быстрый пресет days, либо явное окно
 * date_from/date_to (оба вместе). Если заданы даты, бэк отдаёт им приоритет.
 */
export interface AnalyticsParams {
  days?: AnalyticsPreset;
  date_from?: string;
  date_to?: string;
}

/** Получить аналитику дашборда за период. */
export const getAnalytics = async (
  params: AnalyticsParams = { days: 30 },
): Promise<AnalyticsDashboardResponse> => {
  const response = await apiClient.get<AnalyticsDashboardResponse>(
    ANALYTICS_ENDPOINT,
    { params },
  );
  return response.data;
};