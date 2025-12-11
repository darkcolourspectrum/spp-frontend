import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { activateUser, deactivateUser } from '@/modules/admin/store';
import type { AdminUser } from '@/api/admin/types';
import './userStatusModal.css';

interface UserStatusModalProps {
  user: AdminUser;
  action: 'activate' | 'deactivate';
  onClose: () => void;
}

export const UserStatusModal = ({ user, action, onClose }: UserStatusModalProps) => {
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isActivate = action === 'activate';
  
  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      if (isActivate) {
        await dispatch(activateUser(user.id)).unwrap();
      } else {
        await dispatch(deactivateUser(user.id)).unwrap();
      }
      
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Ошибка при изменении статуса пользователя:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isActivate ? 'Активировать пользователя' : 'Деактивировать пользователя'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          <div className={`status-icon ${isActivate ? 'activate' : 'deactivate'}`}>
            {isActivate ? '✓' : '⛔'}
          </div>
          
          <p className="confirmation-text">
            {isActivate ? (
              <>
                Вы уверены, что хотите <strong>активировать</strong> пользователя{' '}
                <strong>{user.full_name}</strong>?
              </>
            ) : (
              <>
                Вы уверены, что хотите <strong>деактивировать</strong> пользователя{' '}
                <strong>{user.full_name}</strong>?
              </>
            )}
          </p>
          
          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Роль:</span>
              <span className="detail-value">{user.role}</span>
            </div>
            {user.studio_name && (
              <div className="detail-row">
                <span className="detail-label">Студия:</span>
                <span className="detail-value">{user.studio_name}</span>
              </div>
            )}
          </div>
          
          <div className={`action-description ${isActivate ? 'activate' : 'deactivate'}`}>
            {isActivate ? (
              <>
                <strong>Что произойдет:</strong>
                <ul>
                  <li>Пользователь сможет войти в систему</li>
                  <li>Доступ ко всем функциям будет восстановлен</li>
                  <li>Уведомления будут отправляться снова</li>
                </ul>
              </>
            ) : (
              <>
                <strong>Что произойдет:</strong>
                <ul>
                  <li>Пользователь не сможет войти в систему</li>
                  <li>Все активные сессии будут завершены</li>
                  <li>Доступ ко всем функциям будет заблокирован</li>
                </ul>
              </>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="button secondary"
            disabled={isProcessing}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`button ${isActivate ? 'primary' : 'danger'}`}
            disabled={isProcessing}
          >
            {isProcessing 
              ? 'Обработка...' 
              : isActivate 
                ? 'Активировать' 
                : 'Деактивировать'
            }
          </button>
        </div>
      </div>
    </div>
  );
};