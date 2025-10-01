/**
 * Redux Store - главный store приложения
 */

import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/modules/auth/store';
import { profileReducer } from '@/modules/profile/store';

// Создаем store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    // Здесь будут добавляться другие reducers:
    // schedule: scheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем некоторые action types для serializability check
        ignoredActions: ['auth/checkStatus/pending'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Сохраняем store глобально для axios interceptor
(window as any).__REDUX_STORE__ = store;

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;