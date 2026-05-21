/**
 * CRM Store - экспорт всех компонентов store CRM-модуля.
 */

// Reducer
export { default as crmReducer } from './crmSlice/crmReducer';

// Actions
export {
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
} from './crmSlice/crmReducer';

// Action Creators (Thunks)
export {
  fetchLeads,
  fetchLeadDetail,
  changeLeadStatus,
  updateLeadFields,
  addActivity,
  convertLead,
} from './crmSlice/actionCreators';

// Types
export type { CrmState } from './crmSlice/crmReducer';