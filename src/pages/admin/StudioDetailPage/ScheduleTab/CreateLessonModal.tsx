/**
 * CreateLessonModal - модальное окно создания разового занятия
 */

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { fetchAllUsers } from '@/modules/admin/store';
import type { LessonCreate } from '@/api/schedule/types';
import './createPatternModal.css';

interface CreateLessonModalProps {
  studioId: number;
  teacherId?: number;
  onClose: () => void;
}

const CreateLessonModal = ({ studioId, teacherId, onClose }: CreateLessonModalProps) => {
  const dispatch = useAppDispatch();
  const { addLesson, isSubmitting } = useSchedule();
  const { isAdmin } = useAuth();
  const { classrooms, users } = useAppSelector((state) => state.admin);
  
  const [formData, setFormData] = useState({
    studio_id: studioId,
    teacher_id: teacherId,
    classroom_id: null as number | null,
    lesson_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    duration_minutes: 60,
    student_ids: [] as number[],
    notes: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);
  
  const students = users.filter((u) => u.role === 'student' && u.studio_id === studioId);
  const teachers = users.filter((u) => u.role === 'teacher' && u.studio_id === studioId);
  const studioClassrooms = classrooms.filter((c) => c.studio_id === studioId);
  
  const handleStudentToggle = (studentId: number) => {
    setFormData((prev) => {
      const ids = prev.student_ids;
      const next = ids.includes(studentId)
        ? ids.filter((id) => id !== studentId)
        : [...ids, studentId];
      return { ...prev, student_ids: next };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.teacher_id) {
      setError('Выберите преподавателя');
      return;
    }
    if (formData.student_ids.length === 0) {
      setError('Добавьте хотя бы одного ученика');
      return;
    }
    
    const payload: LessonCreate = {
      studio_id: formData.studio_id,
      teacher_id: formData.teacher_id,
      classroom_id: formData.classroom_id,
      lesson_date: formData.lesson_date,
      start_time: formData.start_time,
      duration_minutes: formData.duration_minutes,
      student_ids: formData.student_ids,
      notes: formData.notes || undefined,
    };
    
    try {
      await addLesson(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать занятие');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать разовое занятие</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {isAdmin() && (
            <div className="form-group">
              <label>Преподаватель *</label>
              <select
                value={formData.teacher_id ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, teacher_id: Number(e.target.value) || undefined })
                }
                required
              >
                <option value="">— Выберите —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || `${t.first_name} ${t.last_name}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Дата *</label>
              <input
                type="date"
                value={formData.lesson_date}
                onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Время начала *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
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
                  setFormData({ ...formData, duration_minutes: Number(e.target.value) })
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
          
          <div className="form-group">
            <label>Ученики *</label>
            <div className="students-list">
              {students.length === 0 ? (
                <div className="no-students">В этой студии нет учеников</div>
              ) : (
                students.map((s) => (
                  <label key={s.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.student_ids.includes(s.id)}
                      onChange={() => handleStudentToggle(s.id)}
                    />
                    <span>{s.full_name || `${s.first_name} ${s.last_name}`}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Заметки</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              maxLength={1000}
              placeholder="Дополнительная информация..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать занятие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;