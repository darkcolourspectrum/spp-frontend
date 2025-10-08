import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { changeRole } from '@/modules/admin/store';
import type { AdminUser } from '@/api/admin/types';
import './changeRoleModal.css';

interface ChangeRoleModalProps {
  user: AdminUser;
  onClose: () => void;
}

export const ChangeRoleModal = ({ user, onClose }: ChangeRoleModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAdmin();
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  
  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    await dispatch(changeRole({
      user_id: user.id,
      role: selectedRole as any,
    }));
    
    setTimeout(onClose, 1500);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Изменить роль пользователя</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-info">
            <strong>{user.full_name}</strong>
            <span>{user.email}</span>
          </div>
          
          <div className="form-group">
            <label>Выберите роль</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="modal-select"
            >
              <option value="admin">Администратор</option>
              <option value="teacher">Преподаватель</option>
              <option value="student">Студент</option>
              <option value="guest">Гость</option>
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="modal-button secondary">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="modal-button primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};