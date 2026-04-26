/**
 * API функции для Notification Service
 */

import apiClient from '../instance';
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadResponse,
} from './types';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/api/notifications',
  UNREAD_COUNT: '/api/notifications/unread-count',
  MARK_READ: (id: number) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: '/api/notifications/read-all',
};

export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
}): Promise<NotificationListResponse> => {
  const response = await apiClient.get<NotificationListResponse>(
    NOTIFICATION_ENDPOINTS.LIST,
    { params }
  );
  return response.data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<UnreadCountResponse>(
    NOTIFICATION_ENDPOINTS.UNREAD_COUNT
  );
  return response.data;
};

export const markAsRead = async (notificationId: number): Promise<MarkReadResponse> => {
  const response = await apiClient.patch<MarkReadResponse>(
    NOTIFICATION_ENDPOINTS.MARK_READ(notificationId)
  );
  return response.data;
};

export const markAllAsRead = async (): Promise<MarkReadResponse> => {
  const response = await apiClient.post<MarkReadResponse>(
    NOTIFICATION_ENDPOINTS.MARK_ALL_READ
  );
  return response.data;
};