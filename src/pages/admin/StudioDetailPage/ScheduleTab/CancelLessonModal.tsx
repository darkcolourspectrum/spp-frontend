/**
 * CancelLessonModal - модалка отмены занятия
 *
 * Подтверждение + опциональная причина отмены. После успеха
 * перезагружает расписание студии, чтобы увидеть статус cancelled.
 */

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { cancelLesson, fetchStudioSchedule } from '@/modules/schedule/store';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import './createPatternModal.css';

interface CancelLessonModalProps {
  lesson: ScheduleLessonItem;
  studioId: number;
  onClose: () => void;
}

const CancelLessonModal = ({ lesson, studioId, onClose }: CancelLessonModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting, filters } = useSchedule();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await dispatch(cancelLesson(lesson.lesson_id, reason.trim() || undefined));
      // Перезагружаем расписание студии за тот же диапазон, чтобы UI обновился
      await dispatch(fetchStudioSchedule(studioId, filters.fromDate, filters.toDate));
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Не удалось отменить занятие');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Отменить занятие</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          <p>
            Вы уверены, что хотите отменить занятие{' '}
            <strong>{lesson.lesson_date}</strong> в{' '}
            <strong>{lesson.start_time}</strong>?
          </p>
          <p>
            Преподаватель: <strong>{lesson.teacher_name}</strong>
            <br />
            Учеников: <strong>{lesson.student_ids.length}</strong>
          </p>

          <div className="form-group">
            <label>Причина отмены (необязательно)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Например: преподаватель заболел"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Назад
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отмена...' : 'Отменить занятие'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelLessonModal;