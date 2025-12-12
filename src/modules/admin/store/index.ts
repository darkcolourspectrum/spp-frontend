/**
 * Admin Store - экспорт всех компонентов admin модуля
 */

// Reducer
export { default as adminReducer } from './adminSlice/adminReducer';

// Actions
export {
  setUsers,
  setStudios,
  setClassrooms,
  addClassroom,
  updateClassroom,
  removeClassroom,
  setDashboardStats,
  updateUser,
  updateStudio,
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  setLoadingUsers,
  setLoadingStudios,
  setLoadingClassrooms,
  setLoadingDashboard,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
} from './adminSlice/adminReducer';

// Action Creators (Thunks)
export {
  fetchAllUsers,
  fetchAllStudios,
  fetchStudioClassrooms,
  changeUserRole,
  assignUserToStudio,
  activateUser,
  deactivateUser,
  createNewStudio,
  updateExistingStudio,
  deleteExistingStudio,
  createNewClassroom,
  updateExistingClassroom,
  deleteExistingClassroom,
  fetchDashboardStats,
} from './adminSlice/actionCreators';

// Types
export type { AdminState } from './adminSlice/adminReducer';