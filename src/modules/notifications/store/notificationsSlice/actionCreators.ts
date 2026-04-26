/**
 * Async thunks for Notifications
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationsApi from '@/api/notifications';
import {
  setLoading,
  setNotifications,
  setUnreadCount,
  markRead,
  markAllRead,
  setError,
} from './notificationsReducer';


export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (
    params: { limit?: number; offset?: number; unread_only?: boolean } | undefined,
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const data = await notificationsApi.getNotifications(params);
      dispatch(
        setNotifications({
          notifications: data.notifications,
          total: data.total,
          unreadCount: data.unread_count,
        })
      );
      return data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch notifications';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);


export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await notificationsApi.getUnreadCount();
      dispatch(setUnreadCount(data.unread_count));
      return data.unread_count;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch unread count';
      return rejectWithValue(message);
    }
  }
);


export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: number, { dispatch, rejectWithValue }) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      dispatch(markRead(notificationId));
      return notificationId;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to mark as read';
      return rejectWithValue(message);
    }
  }
);


export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await notificationsApi.markAllAsRead();
      dispatch(markAllRead());
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to mark all as read';
      return rejectWithValue(message);
    }
  }
);