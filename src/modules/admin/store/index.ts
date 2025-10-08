/**
 * Admin Store - экспорт всех компонентов admin модуля
 */

// Reducer
export { default as adminReducer } from './adminSlice/adminReducer';

// Actions
export {
  setUsers,
  setStudios,
  updateUser,
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  setLoadingUsers,
  setLoadingStudios,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearAdminData,
} from './adminSlice/adminReducer';

// Action Creators (Thunks)
export {
  fetchAllUsers,
  fetchAllStudios,
  assignTeacher,
  changeRole,
  assignStudio,
  createNewStudio,
  updateExistingStudio,
  activateExistingStudio,
  deactivateExistingStudio,
} from './adminSlice/actionCreators';

// Types
export type { AdminState } from './adminSlice/adminReducer';