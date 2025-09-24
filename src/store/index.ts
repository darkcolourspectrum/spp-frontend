import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Импортируем настоящие reducers
import authReducer from './auth/authSlice';

// Временные пустые reducers для остальных модулей
const profileReducer = (state = { profile: null }, action: any) => state;
const scheduleReducer = (state = { lessons: [] }, action: any) => state;
const adminReducer = (state = { users: [] }, action: any) => state;
const uiReducer = (state = { loading: false }, action: any) => state;

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    schedule: scheduleReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;