/**
 * CRM Reducer - управление состоянием доски лидов.
 *
 * leads хранится плоским массивом; колонки канбана собираются
 * группировкой по статусу в хуке useCrm - так состояние не
 * рассинхронизируется при drag-and-drop.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Lead, LeadDetail } from '@/api/crm/types';

// ==================== STATE TYPE ====================

export interface CrmState {
  /** Все лиды (плоский список, группируется по статусу в UI). */
  leads: Lead[];

  /** Открытая в модалке карточка лида с журналом активностей. */
  selectedLead: LeadDetail | null;

  /** Статусы загрузки. */
  isLoadingLeads: boolean;
  isLoadingLead: boolean;
  isSubmitting: boolean;

  /** Ошибки и сообщения. */
  error: string | null;
  successMessage: string | null;

  lastUpdated: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: CrmState = {
  leads: [],
  selectedLead: null,
  isLoadingLeads: false,
  isLoadingLead: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
  lastUpdated: null,
};

// ==================== SLICE ====================

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    // Установка всего списка лидов.
    setLeads: (state, action: PayloadAction<Lead[]>) => {
      state.leads = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },

    // Обновление одного лида в списке (после смены статуса, правки и т.п.).
    updateLeadInList: (state, action: PayloadAction<Lead>) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
    },

    // Применить изменения из обновлённого Lead к открытой карточке
    // selectedLead, если это тот же лид. Сохраняем activities (они только
    // в LeadDetail, нет в обычном Lead) - мержим только общие поля.
    patchSelectedLeadFromLead: (state, action: PayloadAction<Lead>) => {
      if (state.selectedLead && state.selectedLead.id === action.payload.id) {
        const { activities } = state.selectedLead;
        state.selectedLead = { ...action.payload, activities };
      }
    },

    // Открытая карточка лида (с журналом).
    setSelectedLead: (state, action: PayloadAction<LeadDetail | null>) => {
      state.selectedLead = action.payload;
    },

    // Очистка выбранного лида (закрытие модалки).
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },

    // Статусы загрузки.
    setLoadingLeads: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLeads = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setLoadingLead: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLead = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Ошибки.
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingLeads = false;
      state.isLoadingLead = false;
      state.isSubmitting = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Сообщения об успехе.
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },

    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    // Очистка данных модуля (при logout).
    clearCrmData: (state) => {
      state.leads = [];
      state.selectedLead = null;
      state.error = null;
      state.successMessage = null;
      state.lastUpdated = null;
    },
  },
});

// ==================== EXPORTS ====================

export const {
  setLeads,
  updateLeadInList,
  patchSelectedLeadFromLead,
  setSelectedLead,
  clearSelectedLead,
  setLoadingLeads,
  setLoadingLead,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearCrmData,
} = crmSlice.actions;

export default crmSlice.reducer;