/**
 * Schedule Store - экспорт всех компонентов schedule модуля
 */

// Reducer
export { default as scheduleReducer } from './scheduleSlice/scheduleReducer';

// Actions
export {
  setPatterns,
  addPattern,
  updatePattern,
  removePattern,
  setSelectedPattern,
  setLessons,
  addLesson,
  updateLesson,
  removeLesson,
  setSelectedLesson,
  setStudioFilter,
  setTeacherFilter,
  setStudentFilter,
  setDateRange,
  resetFilters,
  setLoadingPatterns,
  setLoadingLessons,
  setLoadingSchedule,
  setSubmitting,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  clearScheduleData,
} from './scheduleSlice/scheduleReducer';

// Action Creators (Thunks)
export {
  fetchRecurringPatterns,
  createRecurringPattern,
  updateRecurringPattern,
  deleteRecurringPattern,
  createLesson,
  updateLesson as updateLessonThunk,
  cancelLesson,
  completeLesson,
  markLessonAsMissed,
  deleteLesson,
  fetchStudioSchedule,
  fetchTeacherSchedule,
  fetchStudentSchedule,
  generateLessons,
} from './scheduleSlice/actionCreators';

// Types
export type { ScheduleState } from './scheduleSlice/scheduleReducer';