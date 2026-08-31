/**
 * PatternsList - карточки шаблонов регулярных занятий.
 *
 * Переписан под слоты. Раньше карточка показывала один день недели и
 * одно время, потому что шаблон больше ничего и не мог. Теперь в шапке
 * карточки перечислены все дни, а под ними - строки с временем и
 * кабинетом.
 *
 * Ещё два изменения по мелочи, но заметных в работе:
 *   - кабинет показывается названием, а не "Кабинет #3": имя берётся
 *     из кеша кабинетов студии;
 *   - рядом с периодом действия видно, до какой даты занятия реально
 *     созданы. Без этого "действует до 31 декабря" сбивает с толку,
 *     когда занятий в календаре только на две недели вперёд.
 */

import { useMemo, useState } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { DAY_OF_WEEK_LABELS, WEEK_INTERVAL_LABELS } from '@/api/schedule/types';
import type { RecurringPatternResponse } from '@/api/schedule/types';
import PatternFormModal from './PatternFormModal';
import DeletePatternModal from './DeletePatternModal';
import './patternsList.css';

interface PatternsListProps {
  patterns: RecurringPatternResponse[];
  studioId: number;
  isReadOnly?: boolean;
}

const SHORT_DAY_LABELS: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

const formatHumanDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const pluralizeStudents = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'ученик';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'ученика';
  return 'учеников';
};

const PatternsList = ({
  patterns,
  studioId,
  isReadOnly = false,
}: PatternsListProps) => {
  const { studioClassrooms } = useSchedule();

  const [editingPattern, setEditingPattern] =
    useState<RecurringPatternResponse | null>(null);
  const [deletingPattern, setDeletingPattern] =
    useState<RecurringPatternResponse | null>(null);

  const classroomNameById = useMemo(() => {
    const map = new Map<number, string>();
    studioClassrooms.forEach((room) => map.set(room.id, room.name));
    return map;
  }, [studioClassrooms]);

  const classroomLabel = (classroomId: number | null): string => {
    if (classroomId === null) return 'Онлайн';
    return classroomNameById.get(classroomId) ?? `Кабинет ${classroomId}`;
  };

  if (patterns.length === 0) {
    return (
      <div className="no-patterns">
        <h3>Нет регулярных занятий</h3>
        <p>
          Создайте первый шаблон, чтобы занятия появлялись в расписании
          автоматически
        </p>
      </div>
    );
  }

  return (
    <div className="patterns-list">
      <div className="patterns-grid">
        {patterns.map((pattern) => {
          const sortedSlots = [...pattern.slots].sort(
            (a, b) =>
              a.day_of_week - b.day_of_week ||
              a.start_time.localeCompare(b.start_time)
          );

          return (
            <div
              key={pattern.id}
              className={`pattern-card ${!pattern.is_active ? 'inactive' : ''}`}
            >
              <div className="pattern-header">
                <div className="pattern-days">
                  {sortedSlots.map((slot) => (
                    <span key={slot.id} className="day-chip">
                      {SHORT_DAY_LABELS[slot.day_of_week]}
                    </span>
                  ))}
                </div>
                <span
                  className={`status-badge ${
                    pattern.is_active ? 'active' : 'inactive'
                  }`}
                >
                  {pattern.is_active ? 'Активен' : 'Выключен'}
                </span>
              </div>

              <div className="pattern-body">
                <div className="pattern-slots">
                  {sortedSlots.map((slot) => (
                    <div key={slot.id} className="pattern-slot-row">
                      <span className="slot-day">
                        {DAY_OF_WEEK_LABELS[slot.day_of_week]}
                      </span>
                      <span className="slot-time">
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </span>
                      <span className="slot-room">
                        {classroomLabel(slot.classroom_id)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pattern-meta">
                  {pattern.week_interval === 2 && (
                    <div className="meta-line accent">
                      {WEEK_INTERVAL_LABELS[pattern.week_interval]}
                    </div>
                  )}

                  <div className="meta-line">
                    {pattern.student_ids.length}{' '}
                    {pluralizeStudents(pattern.student_ids.length)}
                  </div>

                  <div className="meta-line">
                    Действует с {formatHumanDate(pattern.valid_from)}
                    {pattern.valid_until
                      ? ` до ${formatHumanDate(pattern.valid_until)}`
                      : ' бессрочно'}
                  </div>

                  <div className="meta-line muted">
                    Занятий создано: {pattern.generated_lessons_count}
                  </div>
                </div>

                {pattern.notes && (
                  <div className="pattern-notes">{pattern.notes}</div>
                )}
              </div>

              {!isReadOnly && (
                <div className="pattern-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => setEditingPattern(pattern)}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-small"
                    onClick={() => setDeletingPattern(pattern)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingPattern && (
        <PatternFormModal
          studioId={studioId}
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