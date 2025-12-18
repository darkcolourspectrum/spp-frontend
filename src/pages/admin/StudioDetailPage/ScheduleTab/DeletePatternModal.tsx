/**
 * DeletePatternModal - модальное окно удаления шаблона
 */

import { useState } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import type { RecurringPatternResponse } from '@/api/schedule/types';

interface DeletePatternModalProps {
  pattern: RecurringPatternResponse;
  onClose: () => void;
}

const DeletePatternModal = ({ pattern, onClose }: DeletePatternModalProps) => {
  const { removeRecurringPattern, isSubmitting } = useSchedule();
  const [error, setError] = useState<string | null>(null);
  
  const handleDelete = async () => {
    try {
      await removeRecurringPattern(pattern.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка удаления шаблона');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Удалить шаблон?</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <p>
            Вы уверены, что хотите удалить этот шаблон расписания?
          </p>
          <p>
            <strong>Создано занятий:</strong> {pattern.generated_lessons_count}
          </p>
          <p className="warning-text">
            ⚠️ Удаление шаблона не удалит уже созданные занятия
          </p>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Отмена
          </button>
          <button onClick={handleDelete} className="btn-danger" disabled={isSubmitting}>
            {isSubmitting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePatternModal;