import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { assignTeacher } from '@/modules/admin/store';
import type { AdminUser, Studio } from '@/api/admin/types';
import './assignTeacherModal.css';

interface AssignTeacherModalProps {
  user: AdminUser;
  studios: Studio[];
  onClose: () => void;
}

export const AssignTeacherModal = ({ user, studios, onClose }: AssignTeacherModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAdmin();
  const [selectedStudioId, setSelectedStudioId] = useState<string>('');
  
  const handleSubmit = async () => {
    if (!selectedStudioId) return;
    
    await dispatch(assignTeacher({
      user_id: user.id,
      studio_id: parseInt(selectedStudioId),
    }));
    
    setTimeout(onClose, 1500);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Назначить преподавателем</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-info">
            <strong>{user.full_name}</strong>
            <span>{user.email}</span>
          </div>
          
          <div className="form-group">
            <label>Выберите студию</label>
            <select
              value={selectedStudioId}
              onChange={(e) => setSelectedStudioId(e.target.value)}
              className="modal-select"
            >
              <option value="">-- Выберите студию --</option>
              {studios.filter(s => s.is_active).map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
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
            disabled={isSubmitting || !selectedStudioId}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};