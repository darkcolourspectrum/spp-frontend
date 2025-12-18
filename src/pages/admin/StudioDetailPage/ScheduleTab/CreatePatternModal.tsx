/**
 * CreatePatternModal - модальное окно создания шаблона
 */

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { fetchAllUsers } from '@/modules/admin/store';
import { useAppDispatch } from '@/store/hooks';
import { DAY_OF_WEEK_LABELS } from '@/api/schedule/types';
import type { RecurringPatternCreate } from '@/api/schedule/types';
import './createPatternModal.css';

interface CreatePatternModalProps {
  studioId: number;
  teacherId?: number;
  onClose: () => void;
}

const CreatePatternModal = ({ studioId, teacherId, onClose }: CreatePatternModalProps) => {
  const dispatch = useAppDispatch();
  const { addRecurringPattern, isSubmitting } = useSchedule();
  const { classrooms } = useAppSelector((state) => state.admin);
  const { users } = useAppSelector((state) => state.admin);
  
  const [formData, setFormData] = useState<Partial<RecurringPatternCreate>>({
    studio_id: studioId,
    teacher_id: teacherId,
    day_of_week: 1,
    start_time: '10:00',
    duration_minutes: 60,
    valid_from: new Date().toISOString().split('T')[0],
    student_ids: [],
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Загружаем пользователей если их нет
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);
  
  // Фильтруем учеников студии
  const students = users.filter(
    (u) => u.role === 'student' && u.studio_id === studioId
  );
  
  // Фильтруем преподавателей студии (если выбор доступен)
  const teachers = users.filter(
    (u) => u.role === 'teacher' && u.studio_id === studioId
  );
  
  // Фильтруем кабинеты студии
  const studioClassrooms = classrooms.filter((c) => c.studio_id === studioId);
  
  const handleInputChange = (field: keyof RecurringPatternCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };
  
  const handleStudentToggle = (studentId: number) => {
    setFormData((prev) => {
      const currentIds = prev.student_ids || [];
      const newIds = currentIds.includes(studentId)
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId];
      
      return { ...prev, student_ids: newIds };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Валидация
    if (!formData.teacher_id) {
      setError('Выберите преподавателя');
      return;
    }
    
    if (!formData.day_of_week) {
      setError('Выберите день недели');
      return;
    }
    
    if (!formData.start_time) {
      setError('Укажите время начала');
      return;
    }
    
    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      setError('Укажите длительность');
      return;
    }
    
    if (!formData.valid_from) {
      setError('Укажите дату начала действия');
      return;
    }
    
    try {
      await addRecurringPattern(formData as RecurringPatternCreate);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания шаблона');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать шаблон расписания</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="pattern-form">
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {/* Преподаватель */}
          {!teacherId && (
            <div className="form-group">
              <label htmlFor="teacher">Преподаватель *</label>
              <select
                id="teacher"
                value={formData.teacher_id || ''}
                onChange={(e) => handleInputChange('teacher_id', parseInt(e.target.value))}
                required
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* День недели */}
          <div className="form-group">
            <label htmlFor="dayOfWeek">День недели *</label>
            <select
              id="dayOfWeek"
              value={formData.day_of_week}
              onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
              required
            >
              {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                <option key={value} value={parseInt(value)}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Время и длительность */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Время начала *</label>
              <input
                type="time"
                id="startTime"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Длительность (мин) *</label>
              <input
                type="number"
                id="duration"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                min="15"
                step="15"
                required
              />
            </div>
          </div>
          
          {/* Кабинет */}
          <div className="form-group">
            <label htmlFor="classroom">Кабинет</label>
            <select
              id="classroom"
              value={formData.classroom_id || ''}
              onChange={(e) => handleInputChange('classroom_id', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Без кабинета</option>
              {studioClassrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} (вместимость: {classroom.capacity})
                </option>
              ))}
            </select>
          </div>
          
          {/* Период действия */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="validFrom">Действует с *</label>
              <input
                type="date"
                id="validFrom"
                value={formData.valid_from}
                onChange={(e) => handleInputChange('valid_from', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="validUntil">Действует до</label>
              <input
                type="date"
                id="validUntil"
                value={formData.valid_until || ''}
                onChange={(e) => handleInputChange('valid_until', e.target.value || null)}
              />
            </div>
          </div>
          
          {/* Ученики */}
          <div className="form-group">
            <label>Ученики</label>
            <div className="students-list">
              {students.length === 0 ? (
                <p className="no-students">Нет учеников в этой студии</p>
              ) : (
                students.map((student) => (
                  <label key={student.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.student_ids?.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                    />
                    <span>{student.full_name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          {/* Заметки */}
          <div className="form-group">
            <label htmlFor="notes">Заметки</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать шаблон'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatternModal;