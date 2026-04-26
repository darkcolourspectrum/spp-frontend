/**
 * Колокольчик уведомлений с badge и dropdown'ом.
 */

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '@/api/notifications/types';
import './notificationBell.css';


const formatTimeAgo = (isoString: string): string => {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} дн назад`;
  
  return then.toLocaleDateString('ru-RU');
};


const NotificationItem = ({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: (id: number) => void;
}) => {
  return (
    <div
      className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
      onClick={() => onClick(notification.id)}
    >
      <div className="notification-item-header">
        <span className="notification-item-title">{notification.title}</span>
        <span className="notification-item-time">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>
      <div className="notification-item-message">{notification.message}</div>
    </div>
  );
};


const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Закрытие при клике вне dropdown'а
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // При открытии — подгружаем актуальный список
  const handleToggle = () => {
    if (!isOpen) {
      refresh();
    }
    setIsOpen((prev) => !prev);
  };
  
  const handleItemClick = (id: number) => {
    markAsRead(id);
  };
  
  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={handleToggle}
        aria-label="Уведомления"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span className="dropdown-title">Уведомления</span>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={() => markAllAsRead()}
              >
                Прочитать все
              </button>
            )}
          </div>
          
          <div className="notification-dropdown-list">
            {isLoading && <div className="notification-empty">Загрузка...</div>}
            
            {!isLoading && notifications.length === 0 && (
              <div className="notification-empty">Уведомлений пока нет</div>
            )}
            
            {!isLoading &&
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={handleItemClick}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default NotificationBell;