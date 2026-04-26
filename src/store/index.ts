/**
 * Redux Store - главный store приложения
 */

import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/modules/auth/store';
import { profileReducer } from '@/modules/profile/store';
import { adminReducer } from '@/modules/admin/store';
import { scheduleReducer } from '@/modules/schedule/store';
import { notificationsReducer } from '@/modules/notifications/store';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    admin: adminReducer,
    schedule: scheduleReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/checkStatus/pending'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

(window as any).__REDUX_STORE__ = store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;