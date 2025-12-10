/**
 * Admin Store - экспорт всех компонентов admin модуля
 */

// Reducer
export { default as adminReducer } from './adminSlice/adminReducer';

// Actions
export {
  setUsers,
  setStudios,
  setDashboardStats,
  updateUser,
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  setLoadingUsers,
  setLoadingStudios,
  setLoadingDashboard,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
} from './adminSlice/adminReducer';

// Action Creators (Thunks) - ОБНОВЛЁННЫЕ НАЗВАНИЯ
export {
  fetchAllUsers,
  fetchAllStudios,
  changeUserRole,
  assignUserToStudio,
  activateUser,
  deactivateUser,
  createNewStudio,
  updateExistingStudio,
  deleteExistingStudio,
  fetchDashboardStats,
} from './adminSlice/actionCreators';

// Types
export type { AdminState } from './adminSlice/adminReducer';