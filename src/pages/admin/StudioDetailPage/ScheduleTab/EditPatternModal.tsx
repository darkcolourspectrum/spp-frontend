/**
 * EditPatternModal - модальное окно редактирования шаблона
 * TODO: Реализовать полностью позже
 */

import { useSchedule } from '@/modules/schedule/hooks/useSchedule'
import type { RecurringPatternResponse } from '@/api/schedule/types';

interface EditPatternModalProps {
  pattern: RecurringPatternResponse;
  onClose: () => void;
}

const EditPatternModal = ({ pattern, onClose }: EditPatternModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактирование шаблона</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <p>Редактирование шаблона #{pattern.id}</p>
          <p>TODO: Реализовать форму редактирования</p>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatternModal;