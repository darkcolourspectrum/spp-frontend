import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { deleteExistingStudio } from '@/modules/admin/store';
import type { Studio } from '@/api/admin/types';
import './deleteStudioModal.css';

interface DeleteStudioModalProps {
  studio: Studio;
  onClose: () => void;
}

export const DeleteStudioModal = ({ studio, onClose }: DeleteStudioModalProps) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await dispatch(deleteExistingStudio(studio.id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении студии:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Удаление студии</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">⚠️</div>
          <p className="warning-text">
            Вы действительно хотите удалить студию <strong>{studio.name}</strong>?
          </p>
          <p className="warning-subtext">
            Это действие невозможно отменить. Все связанные данные (кабинеты, расписание) также будут удалены.
          </p>
          
          <div className="studio-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">{studio.id}</span>
            </div>
            {studio.address && (
              <div className="info-row">
                <span className="info-label">Адрес:</span>
                <span className="info-value">{studio.address}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="button secondary"
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="button danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить студию'}
          </button>
        </div>
      </div>
    </div>
  );
};