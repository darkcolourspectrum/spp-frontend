/**
 * PatternsList - список шаблонов повторяющихся занятий
 */

import { useState } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { DAY_OF_WEEK_LABELS } from '@/api/schedule/types';
import type { RecurringPatternResponse } from '@/api/schedule/types';
import EditPatternModal from './EditPatternModal';
import DeletePatternModal from './DeletePatternModal';
import './patternsList.css';

interface PatternsListProps {
  patterns: RecurringPatternResponse[];
  studioId: number;
  isReadOnly?: boolean;
}

const PatternsList = ({ patterns, studioId, isReadOnly = false }: PatternsListProps) => {
  const [editingPattern, setEditingPattern] = useState<RecurringPatternResponse | null>(null);
  const [deletingPattern, setDeletingPattern] = useState<RecurringPatternResponse | null>(null);
  
  const handleEdit = (pattern: RecurringPatternResponse) => {
    setEditingPattern(pattern);
  };
  
  const handleDelete = (pattern: RecurringPatternResponse) => {
    setDeletingPattern(pattern);
  };
  
  if (patterns.length === 0) {
    return (
      <div className="no-patterns">
        <div className="no-patterns-icon"></div>
        <h3>Нет шаблонов расписания</h3>
        <p>Создайте первый шаблон для автоматической генерации занятий</p>
      </div>
    );
  }
  
  return (
    <div className="patterns-list">
      <div className="patterns-grid">
        {patterns.map((pattern) => (
          <div key={pattern.id} className={`pattern-card ${!pattern.is_active ? 'inactive' : ''}`}>
            <div className="pattern-header">
              <div className="pattern-day">
                {DAY_OF_WEEK_LABELS[pattern.day_of_week]}
              </div>
              <div className="pattern-status">
                <span className={`status-badge ${pattern.is_active ? 'active' : 'inactive'}`}>
                  {pattern.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>
            
            <div className="pattern-body">
              <div className="pattern-time">
                <span className="time-icon"></span>
                <span className="time-text">
                  {pattern.start_time} ({pattern.duration_minutes} мин)
                </span>
              </div>
              
              {pattern.classroom_id && (
                <div className="pattern-classroom">
                  <span className="classroom-icon"></span>
                  <span className="classroom-text">Кабинет #{pattern.classroom_id}</span>
                </div>
              )}
              
              <div className="pattern-students">
                <span className="students-icon"></span>
                <span className="students-text">
                  {pattern.student_ids.length} {pattern.student_ids.length === 1 ? 'ученик' : 'учеников'}
                </span>
              </div>
              
              <div className="pattern-validity">
                <span className="validity-icon"></span>
                <span className="validity-text">
                  С {new Date(pattern.valid_from).toLocaleDateString('ru-RU')}
                  {pattern.valid_until && ` до ${new Date(pattern.valid_until).toLocaleDateString('ru-RU')}`}
                </span>
              </div>
              
              <div className="pattern-generated">
                <span className="generated-icon"></span>
                <span className="generated-text">
                  Создано занятий: {pattern.generated_lessons_count}
                </span>
              </div>
              
              {pattern.notes && (
                <div className="pattern-notes">
                  <span className="notes-icon"></span>
                  <span className="notes-text">{pattern.notes}</span>
                </div>
              )}
            </div>
            
            {!isReadOnly && (
              <div className="pattern-actions">
                <button
                  onClick={() => handleEdit(pattern)}
                  className="action-button edit"
                  title="Редактировать"
                >
                  
                </button>
                <button
                  onClick={() => handleDelete(pattern)}
                  className="action-button delete"
                  title="Удалить"
                >
                  
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Modals */}
      {editingPattern && (
        <EditPatternModal
          pattern={editingPattern}
          onClose={() => setEditingPattern(null)}
        />
      )}
      
      {deletingPattern && (
        <DeletePatternModal
          pattern={deletingPattern}
          onClose={() => setDeletingPattern(null)}
        />
      )}
    </div>
  );
};

export default PatternsList;