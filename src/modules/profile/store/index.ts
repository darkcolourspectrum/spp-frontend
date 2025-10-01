/**
 * Profile Store - экспорт всех компонентов profile модуля
 */

// Reducer
export { default as profileReducer } from './profileSlice/profileReducer';

// Actions
export {
  setProfile,
  updateProfile,
  setAvatar,
  removeAvatar,
  setDashboard,
  setLoading,
  setUpdating,
  setUploadingAvatar,
  setError,
  clearError,
  clearProfile,
} from './profileSlice/profileReducer';

// Action Creators (Thunks)
export {
  fetchMyProfile,
  updateMyProfile,
  uploadAvatarFile,
  deleteAvatarFile,
  fetchDashboard,
  fetchProfileById,
} from './profileSlice/actionCreators';

// Types
export type { ProfileState } from './profileSlice/profileReducer';