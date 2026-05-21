import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { Lead, LeadStatus } from '@/api/crm/types';
import {
  clearError,
  clearSuccessMessage,
  clearSelectedLead,
} from '../store';

/**
 * Колонки канбан-доски в порядке слева направо.
 *
 * Порядок отражает движение лида по воронке: NEW в начале, LOST в конце
 * как "терминальный выход". CONVERTED и LOST оба терминальные, но
 * CONVERTED - успешный финал, LOST - неуспешный, поэтому LOST последний.
 */
export const LEAD_STATUS_COLUMNS: LeadStatus[] = [
  'new',
  'contacted',
  'trial_scheduled',
  'trial_attended',
  'converted',
  'lost',
];

/** Человекочитаемые названия статусов для заголовков колонок. */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Новые',
  contacted: 'В работе',
  trial_scheduled: 'Записаны на пробное',
  trial_attended: 'Посетили пробное',
  converted: 'Стали клиентами',
  lost: 'Потеряны',
};

/** Тип сгруппированной доски: статус -> лиды этого статуса. */
export type LeadsByStatus = Record<LeadStatus, Lead[]>;

export const useCrm = () => {
  const dispatch = useAppDispatch();

  const {
    leads,
    selectedLead,
    isLoadingLeads,
    isLoadingLead,
    isSubmitting,
    error,
    successMessage,
  } = useAppSelector((state) => state.crm);

  /**
   * Лиды, сгруппированные по статусу - готовая структура для колонок
   * канбана. Внутри каждой колонки сортируем по убыванию created_at
   * (свежие сверху).
   */
  const leadsByStatus = useMemo<LeadsByStatus>(() => {
    const grouped: LeadsByStatus = {
      new: [],
      contacted: [],
      trial_scheduled: [],
      trial_attended: [],
      converted: [],
      lost: [],
    };

    for (const lead of leads) {
      const column = grouped[lead.status as LeadStatus];
      if (column) {
        column.push(lead);
      }
    }

    for (const status of LEAD_STATUS_COLUMNS) {
      grouped[status].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return grouped;
  }, [leads]);

  // Очистка сообщений и выбранного лида.
  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearSuccess = () => {
    dispatch(clearSuccessMessage());
  };

  const handleCloseLeadDetail = () => {
    dispatch(clearSelectedLead());
  };

  return {
    // Состояние
    leads,
    leadsByStatus,
    selectedLead,
    isLoadingLeads,
    isLoadingLead,
    isSubmitting,
    error,
    successMessage,

    // Действия
    handleClearError,
    handleClearSuccess,
    handleCloseLeadDetail,
  };
};