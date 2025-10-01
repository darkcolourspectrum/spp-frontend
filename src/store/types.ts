/**
 * Общие типы для Redux Store
 */

import type { RootState, AppDispatch } from './index';

// Реэкспорт для удобства
export type { RootState, AppDispatch };

// Тип для async thunk
export type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
};