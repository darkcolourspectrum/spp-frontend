/**
 * Типы для Notification Service API
 */

export type NotificationType =
  | 'lesson_created'
  | 'lesson_cancelled'
  | 'lesson_reminder'
  | 'test'
  | string;

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
}