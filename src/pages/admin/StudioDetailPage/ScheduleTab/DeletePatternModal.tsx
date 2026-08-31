/**
 * DeletePatternModal - удаление шаблона.
 *
 * Переписан, потому что удаление шаблона перестало быть однозначным
 * действием. Раньше оно молча сносило все связанные занятия, включая
 * проведённые: в модели стоял cascade="all, delete-orphan" поверх
 * ondelete="SET NULL", и ORM выигрывал. История посещений исчезала
 * вместе с шаблоном.
 *
 * Теперь у админа есть выбор, а прошлое защищено в любом случае:
 *   - по умолчанию занятия остаются в расписании, просто перестают
 *     быть связанными с шаблоном;
 *   - с галочкой удаляются будущие занятия, но только те, что не
 *     проводились и не правились вручную;
 *   - прошедшие и проведённые занятия не удаляются никогда.
 *
 * Отдельной кнопкой вынесено выключение шаблона - обычно нужно именно
 * оно, а не удаление: занятия доживают до конца горизонта, новые
 * не создаются.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteRecurringPattern,
  updateRecurringPattern,
} from '@/modules/schedule/store/scheduleSlice/actionCreators';
import type { RecurringPatternResponse } from '@/api/schedule/types';
import './createPatternModal.css';

interface DeletePatternModalProps {
  pattern: RecurringPatternResponse;
  onClose: () => void;
}

const DeletePatternModal = ({ pattern, onClose }: DeletePatternModalProps) => {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((state) => state.schedule.isSubmitting);

  const [deleteFutureLessons, setDeleteFutureLessons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    setError(null);
    try {
      await dispatch(
        updateRecurringPattern(pattern.id, { is_active: false })
      );
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Не удалось выключить шаблон'
      );
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await dispatch(deleteRecurringPattern(pattern.id, deleteFutureLessons));
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Не удалось удалить шаблон');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content small"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Удалить шаблон</h2>
          <button onClick={onClose} className="close-button" type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ margin: '0 0 16px 0' }}>
              <span className="error-icon">!</span>
              {error}
            </div>
          )}

          <p>
            Шаблон перестанет существовать. Уже созданные занятия по
            умолчанию останутся в расписании.
          </p>

          <label className="student-checkbox" style={{ padding: '10px 0' }}>
            <input
              type="checkbox"
              checked={deleteFutureLessons}
              onChange={(event) =>
                setDeleteFutureLessons(event.target.checked)
              }
            />
            <span>Удалить и будущие занятия этого шаблона</span>
          </label>

          <p className="warning-text">
            Прошедшие и проведённые занятия не удаляются ни при каком
            варианте — они нужны для истории посещений.
          </p>

          <p style={{ marginTop: 16 }}>
            Если нужно просто прекратить регулярные занятия, лучше
            выключить шаблон: расписание доживёт до конца, а новые занятия
            создаваться не будут.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            className="btn-secondary"
            disabled={isSubmitting || !pattern.is_active}
          >
            Выключить
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePatternModal;