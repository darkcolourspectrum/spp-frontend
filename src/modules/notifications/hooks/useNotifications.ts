/**
 * Хук для работы с уведомлениями.
 * 
 * Запускает background polling счётчика непрочитанных каждые 30 секунд.
 * Polling останавливается при unmount или logout.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../store';


const POLLING_INTERVAL_MS = 30_000;


export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  const {
    notifications,
    unreadCount,
    total,
    isLoading,
    error,
    lastFetched,
  } = useAppSelector((state) => state.notifications);
  
  const refresh = useCallback(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);
  
  const refreshCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);
  
  const markAsRead = useCallback(
    (id: number) => {
      dispatch(markNotificationRead(id));
    },
    [dispatch]
  );
  
  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);
  
  // Polling: каждые 30 сек обновляем счётчик непрочитанных
  useEffect(() => {
    if (!isAuthenticated) return;
    
    refreshCount();
    
    const interval = setInterval(() => {
      refreshCount();
    }, POLLING_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshCount]);
  
  return {
    notifications,
    unreadCount,
    total,
    isLoading,
    error,
    lastFetched,
    
    refresh,
    refreshCount,
    markAsRead,
    markAllAsRead,
  };
};