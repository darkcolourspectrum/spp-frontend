/**
 * RescheduleLessonModal - модалка переноса занятия
 *
 * Позволяет менять дату, время начала, длительность и кабинет.
 * После успешного PATCH перезагружает расписание студии.
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import {
  updateLessonThunk,
  fetchStudioSchedule,
} from '@/modules/schedule/store';
import { fetchStudioClassrooms } from '@/modules/admin/store';
import type { ScheduleLessonItem, LessonUpdate } from '@/api/schedule/types';
import './createPatternModal.css';

interface RescheduleLessonModalProps {
  lesson: ScheduleLessonItem;
  studioId: number;
  onClose: () => void;
}

const calcDurationMinutes = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

const trimSeconds = (t: string): string => {
  // backend может присылать "HH:MM:SS", input[type=time] хочет "HH:MM"
  return t.length >= 5 ? t.slice(0, 5) : t;
};

const RescheduleLessonModal = ({ lesson, studioId, onClose }: RescheduleLessonModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting, filters } = useSchedule();
  const { classrooms } = useAppSelector((state) => state.admin);

  const initialStart = trimSeconds(lesson.start_time);
  const initialEnd = trimSeconds(lesson.end_time);
  const initialDuration = calcDurationMinutes(initialStart, initialEnd);

  const [formData, setFormData] = useState({
    lesson_date: lesson.lesson_date,
    start_time: initialStart,
    duration_minutes: initialDuration > 0 ? initialDuration : 60,
    classroom_id: lesson.classroom_id,
  });

  const [error, setError] = useState<string | null>(null);

  // Подгружаем кабинеты студии, если их нет в admin store
  useEffect(() => {
    const studioHasClassrooms = classrooms.some((c) => c.studio_id === studioId);
    if (!studioHasClassrooms) {
      dispatch(fetchStudioClassrooms(studioId));
    }
  }, [dispatch, studioId, classrooms]);

  const studioClassrooms = useMemo(
    () => classrooms.filter((c) => c.studio_id === studioId && c.is_active),
    [classrooms, studioId]
  );

  // Изменилось ли что-то по сравнению с исходным занятием
  const hasChanges =
    formData.lesson_date !== lesson.lesson_date ||
    formData.start_time !== initialStart ||
    formData.duration_minutes !== initialDuration ||
    formData.classroom_id !== lesson.classroom_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasChanges) {
      setError('Ничего не изменено');
      return;
    }

    // Шлём только реально изменённые поля - чтобы бэк не делал
    // лишних проверок конфликтов и не публиковал rescheduled зря.
    const payload: LessonUpdate = {};
    if (formData.lesson_date !== lesson.lesson_date) {
      payload.lesson_date = formData.lesson_date;
    }
    if (formData.start_time !== initialStart) {
      payload.start_time = formData.start_time;
    }
    if (formData.duration_minutes !== initialDuration) {
      payload.duration_minutes = formData.duration_minutes;
    }
    if (formData.classroom_id !== lesson.classroom_id) {
      payload.classroom_id = formData.classroom_id;
    }

    try {
      await dispatch(updateLessonThunk(lesson.lesson_id, payload));
      await dispatch(fetchStudioSchedule(studioId, filters.fromDate, filters.toDate));
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Не удалось перенести занятие');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Перенести занятие</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p>
            Текущее: <strong>{lesson.lesson_date}</strong>{' '}
            <strong>{initialStart}</strong> — <strong>{initialEnd}</strong>
            <br />
            Преподаватель: <strong>{lesson.teacher_name}</strong>
            <br />
            Учеников: <strong>{lesson.student_ids.length}</strong>
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Дата *</label>
              <input
                type="date"
                value={formData.lesson_date}
                onChange={(e) =>
                  setFormData({ ...formData, lesson_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Время начала *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Длительность (мин) *</label>
              <input
                type="number"
                min={30}
                max={180}
                step={10}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Кабинет</label>
            <select
              value={formData.classroom_id ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classroom_id: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">— Без кабинета (онлайн) —</option>
              {studioClassrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? 'Сохранение...' : 'Перенести'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleLessonModal;