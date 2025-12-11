import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { assignUserToStudio } from '@/modules/admin/store';
import type { AdminUser } from '@/api/admin/types';
import './assignStudioModal.css';

interface AssignStudioModalProps {
  user: AdminUser;
  onClose: () => void;
}

export const AssignStudioModal = ({ user, onClose }: AssignStudioModalProps) => {
  const dispatch = useAppDispatch();
  const { studios, isSubmitting } = useAdmin();
  const [selectedStudioId, setSelectedStudioId] = useState<number | null>(user.studio_id);
  
  const activeStudios = studios.filter(s => s.is_active);
  
  const handleSubmit = async () => {
    if (!selectedStudioId) return;
    
    await dispatch(assignUserToStudio({
      userId: user.id,
      studioId: selectedStudioId,
    }));
    
    setTimeout(onClose, 1500);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Привязать к студии</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-info">
            <strong>{user.full_name}</strong>
            <span>{user.email}</span>
            {user.studio_name && (
              <span className="current-studio">
                Текущая студия: <strong>{user.studio_name}</strong>
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label>Выберите студию</label>
            {activeStudios.length === 0 ? (
              <div className="no-studios-message">
                <p>Нет доступных студий</p>
                <small>Сначала создайте хотя бы одну активную студию</small>
              </div>
            ) : (
              <select
                value={selectedStudioId || ''}
                onChange={(e) => setSelectedStudioId(Number(e.target.value))}
                className="modal-select"
              >
                <option value="">-- Выберите студию --</option>
                {activeStudios.map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.name}
                    {studio.address && ` (${studio.address})`}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {selectedStudioId && (
            <div className="studio-details">
              {activeStudios.find(s => s.id === selectedStudioId)?.description && (
                <p className="studio-description">
                  {activeStudios.find(s => s.id === selectedStudioId)?.description}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="button secondary">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="button primary"
            disabled={isSubmitting || !selectedStudioId || activeStudios.length === 0}
          >
            {isSubmitting ? 'Сохранение...' : 'Привязать'}
          </button>
        </div>
      </div>
    </div>
  );
};