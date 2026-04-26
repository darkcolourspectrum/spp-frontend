/**
 * Notifications Reducer
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/api/notifications/types';


export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}


const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
};


const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setNotifications: (
      state,
      action: PayloadAction<{ notifications: Notification[]; total: number; unreadCount: number }>
    ) => {
      state.notifications = action.payload.notifications;
      state.total = action.payload.total;
      state.unreadCount = action.payload.unreadCount;
      state.lastFetched = new Date().toISOString();
      state.isLoading = false;
      state.error = null;
    },
    
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    
    markRead: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const item = state.notifications.find((n) => n.id === id);
      if (item && !item.is_read) {
        item.is_read = true;
        item.read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllRead: (state) => {
      state.notifications.forEach((n) => {
        if (!n.is_read) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
      state.error = null;
      state.lastFetched = null;
    },
  },
});


export const {
  setLoading,
  setNotifications,
  setUnreadCount,
  markRead,
  markAllRead,
  setError,
  clearNotifications,
} = notificationsSlice.actions;


export default notificationsSlice.reducer;