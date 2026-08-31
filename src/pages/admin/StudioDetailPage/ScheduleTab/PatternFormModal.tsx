/**
 * PatternFormModal - создание и редактирование шаблона регулярных занятий.
 *
 * Заменяет CreatePatternModal и EditPatternModal. Раньше это были два
 * почти одинаковых файла, расходившихся при каждой правке; теперь режим
 * определяется наличием пропа pattern.
 *
 * Ключевое отличие от прежней формы - слоты. Шаблон больше не "один день
 * недели и одно время", а набор строк "день + время + длительность +
 * кабинет". Занятия по вторникам и четвергам - это один шаблон с двумя
 * слотами, а не два шаблона с продублированным списком учеников.
 *
 * Предпросмотр пересчитывается сам через полсекунды после последнего
 * изменения. Это дороже одного ручного нажатия, но убирает ситуацию,
 * когда админ поменял время и отправил форму, не обновив расчёт, -
 * то есть увидел одни числа, а получил другие.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import {
  createRecurringPattern,
  updateRecurringPattern,
  previewRecurringPattern,
} from '@/modules/schedule/store/scheduleSlice/actionCreators';
import {
  DAY_OF_WEEK_LABELS,
  WEEK_INTERVAL_LABELS,
  WORKING_DAYS,
} from '@/api/schedule/types';
import type {
  RecurringPatternCreate,
  RecurringPatternPreviewResponse,
  RecurringPatternResponse,
  RecurringPatternSlotCreate,
} from '@/api/schedule/types';
import './patternFormModal.css';

interface PatternFormModalProps {
  studioId: number;
  /** Задан - преподаватель создаёт шаблон себе, выбор скрыт */
  teacherId?: number;
  /** Режим редактирования: шаблон, который правим */
  pattern?: RecurringPatternResponse | null;
  onClose: () => void;
}

const PREVIEW_DEBOUNCE_MS = 500;
const MAX_SLOTS = 7;
const MAX_VISIBLE_CONFLICTS = 5;

/**
 * Локальная дата без сдвига в UTC.
 *
 * new Date().toISOString() отдаёт время по Гринвичу: в Томске (+07)
 * с полуночи до семи утра это вчерашняя дата. Форма подставляла бы
 * вчерашний день как дату начала действия шаблона.
 */
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatHumanDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const makeEmptySlot = (): RecurringPatternSlotCreate => ({
  day_of_week: WORKING_DAYS[0],
  start_time: '18:00',
  duration_minutes: 60,
  classroom_id: null,
});

/** Следующий рабочий день по кругу. Нерабочие дни пропускаются. */
const nextWorkingDay = (day: number): number => {
  const index = WORKING_DAYS.indexOf(day);
  return WORKING_DAYS[(index + 1) % WORKING_DAYS.length];
};

/**
 * Пересечения слотов между собой.
 *
 * Ту же проверку делает бекенд, но ждать ответа сервера, чтобы узнать
 * об очевидной ошибке, - плохой обмен. Здесь она мгновенная.
 */
const findSlotOverlaps = (
  slots: RecurringPatternSlotCreate[]
): [number, number] | null => {
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      if (slots[i].day_of_week !== slots[j].day_of_week) continue;

      const startA = timeToMinutes(slots[i].start_time);
      const endA = startA + slots[i].duration_minutes;
      const startB = timeToMinutes(slots[j].start_time);
      const endB = startB + slots[j].duration_minutes;

      if (startA < endB && startB < endA) return [i, j];
    }
  }
  return null;
};

const PatternFormModal = ({
  studioId,
  teacherId,
  pattern,
  onClose,
}: PatternFormModalProps) => {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((state) => state.schedule.isSubmitting);

  const {
    studioMembers,
    studioClassrooms,
    loadStudioMembers,
    loadStudioClassroomsForSchedule,
  } = useSchedule();

  const isEditMode = Boolean(pattern);

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    pattern?.teacher_id ?? teacherId ?? null
  );
  const [validFrom, setValidFrom] = useState<string>(
    pattern?.valid_from ?? formatLocalDate(new Date())
  );
  const [validUntil, setValidUntil] = useState<string>(
    pattern?.valid_until ?? ''
  );
  const [weekInterval, setWeekInterval] = useState<1 | 2>(
    (pattern?.week_interval as 1 | 2) ?? 1
  );
  const [slots, setSlots] = useState<RecurringPatternSlotCreate[]>(
    pattern?.slots.map((slot) => ({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time.slice(0, 5),
      duration_minutes: slot.duration_minutes,
      classroom_id: slot.classroom_id,
    })) ?? [makeEmptySlot()]
  );
  const [studentIds, setStudentIds] = useState<number[]>(
    pattern?.student_ids ?? []
  );
  const [notes, setNotes] = useState<string>(pattern?.notes ?? '');

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RecurringPatternPreviewResponse | null>(
    null
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Длинный список конфликтов сворачивается: показываем первые пять,
  // остальные по кнопке. Сбрасывается при каждом пересчёте, чтобы
  // развёрнутый старый список не выдавался за новый.
  const [showAllConflicts, setShowAllConflicts] = useState(false);

  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadStudioMembers(studioId);
    loadStudioClassroomsForSchedule(studioId);
  }, [studioId, loadStudioMembers, loadStudioClassroomsForSchedule]);

  const students = studioMembers?.students ?? [];
  const teachers = studioMembers?.teachers ?? [];

  const classroomNameById = useMemo(() => {
    const map = new Map<number, string>();
    studioClassrooms.forEach((room) => map.set(room.id, room.name));
    return map;
  }, [studioClassrooms]);

  // ==================== ВАЛИДАЦИЯ ====================

  const validationError = useMemo((): string | null => {
    if (!selectedTeacherId) return 'Выберите преподавателя';
    if (slots.length === 0) return 'Добавьте хотя бы один день';
    if (!validFrom) return 'Укажите дату начала действия';

    if (validUntil && validUntil < validFrom) {
      return 'Дата окончания не может быть раньше даты начала';
    }

    for (let i = 0; i < slots.length; i += 1) {
      if (!WORKING_DAYS.includes(slots[i].day_of_week)) {
        return `День ${i + 1}: в этот день студия не работает`;
      }

      const end = timeToMinutes(slots[i].start_time) + slots[i].duration_minutes;
      if (end >= 24 * 60) {
        return `День ${i + 1}: занятие выходит за пределы суток`;
      }
    }

    const overlap = findSlotOverlaps(slots);
    if (overlap) {
      const [first, second] = overlap;
      return (
        `Дни ${first + 1} и ${second + 1} пересекаются по времени. ` +
        'Преподаватель не может вести два занятия одновременно'
      );
    }

    return null;
  }, [selectedTeacherId, slots, validFrom, validUntil]);

  const buildPayload = useCallback((): RecurringPatternCreate => {
    return {
      studio_id: studioId,
      teacher_id: selectedTeacherId as number,
      valid_from: validFrom,
      valid_until: validUntil || null,
      week_interval: weekInterval,
      slots,
      student_ids: studentIds,
      notes: notes || undefined,
    };
  }, [
    studioId,
    selectedTeacherId,
    validFrom,
    validUntil,
    weekInterval,
    slots,
    studentIds,
    notes,
  ]);

  // ==================== ПРЕДПРОСМОТР ====================

  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);

    if (validationError) {
      setPreview(null);
      setIsPreviewLoading(false);
      return;
    }

    previewTimer.current = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const result = await dispatch(
          previewRecurringPattern({
            ...buildPayload(),
            pattern_id: pattern?.id,
          })
        );
        setPreview(result ?? null);
      } catch {
        // Ошибку уже показал thunk через setError в сторе.
        setPreview(null);
      } finally {
        setIsPreviewLoading(false);
        setShowAllConflicts(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [buildPayload, validationError, dispatch, pattern?.id]);

  // ==================== СЛОТЫ ====================

  const updateSlot = (
    index: number,
    field: keyof RecurringPatternSlotCreate,
    value: number | string | null
  ) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
    setError(null);
  };

  const addSlot = () => {
    if (slots.length >= MAX_SLOTS) return;

    // Новый слот наследует время и кабинет последнего, но встаёт на
    // следующий рабочий день: чаще всего добавляют второй день с теми же
    // параметрами, и не приходится заполнять всё заново.
    const last = slots[slots.length - 1] ?? makeEmptySlot();
    setSlots((prev) => [
      ...prev,
      {
        ...last,
        day_of_week: nextWorkingDay(last.day_of_week),
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleStudent = (studentId: number) => {
    setStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // ==================== ОТПРАВКА ====================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (isEditMode && pattern) {
        await dispatch(updateRecurringPattern(pattern.id, buildPayload()));
      } else {
        await dispatch(createRecurringPattern(buildPayload()));
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          (isEditMode
            ? 'Не удалось сохранить шаблон'
            : 'Не удалось создать шаблон')
      );
    }
  };

  const submitLabel = (): string => {
    if (isSubmitting) return 'Сохранение...';
    if (isEditMode) return 'Сохранить изменения';
    if (preview && preview.will_create_count > 0) {
      return `Создать ${preview.will_create_count} занятий`;
    }
    return 'Создать шаблон';
  };

  const visibleConflicts = preview
    ? showAllConflicts
      ? preview.conflicts
      : preview.conflicts.slice(0, MAX_VISIBLE_CONFLICTS)
    : [];

  // ==================== РАЗМЕТКА ====================

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditMode ? 'Редактировать шаблон' : 'Регулярные занятия'}</h2>
          <button onClick={onClose} className="close-button" type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pattern-form">
          {error && (
            <div className="form-error">
              <span className="error-icon">!</span>
              {error}
            </div>
          )}

          {/* Преподаватель и периодичность */}
          <div className="form-row">
            {!teacherId && !isEditMode ? (
              <div className="form-group">
                <label htmlFor="teacher">Преподаватель *</label>
                <select
                  id="teacher"
                  value={selectedTeacherId ?? ''}
                  onChange={(event) =>
                    setSelectedTeacherId(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
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
            ) : (
              <div className="form-group">
                <label>Преподаватель</label>
                <div className="form-static-value">
                  {teachers.find((t) => t.id === selectedTeacherId)?.full_name ??
                    'Текущий преподаватель'}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="weekInterval">Повторение</label>
              <select
                id="weekInterval"
                value={weekInterval}
                onChange={(event) =>
                  setWeekInterval(Number(event.target.value) as 1 | 2)
                }
              >
                {Object.entries(WEEK_INTERVAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Период действия */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="validFrom">Действует с *</label>
              <input
                type="date"
                id="validFrom"
                value={validFrom}
                onChange={(event) => setValidFrom(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="validUntil">Действует до</label>
              <input
                type="date"
                id="validUntil"
                value={validUntil}
                min={validFrom}
                onChange={(event) => setValidUntil(event.target.value)}
              />
            </div>
          </div>

          {/* Слоты */}
          <div className="slots-section">
            <div className="section-header">
              <h3>Дни и время</h3>
              <span className="section-hint">
                Один шаблон может занимать несколько дней недели
              </span>
            </div>

            <div className="slots-list">
              {slots.map((slot, index) => (
                <div className="slot-row" key={index}>
                  <select
                    value={slot.day_of_week}
                    onChange={(event) =>
                      updateSlot(index, 'day_of_week', Number(event.target.value))
                    }
                    aria-label="День недели"
                  >
                    {WORKING_DAYS.map((day) => (
                      <option key={day} value={day}>
                        {DAY_OF_WEEK_LABELS[day]}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(event) =>
                      updateSlot(index, 'start_time', event.target.value)
                    }
                    aria-label="Время начала"
                    required
                  />

                  <select
                    value={slot.duration_minutes}
                    onChange={(event) =>
                      updateSlot(
                        index,
                        'duration_minutes',
                        Number(event.target.value)
                      )
                    }
                    aria-label="Длительность"
                  >
                    {[30, 45, 60, 90, 120].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} мин
                      </option>
                    ))}
                  </select>

                  <select
                    value={slot.classroom_id ?? ''}
                    onChange={(event) =>
                      updateSlot(
                        index,
                        'classroom_id',
                        event.target.value ? Number(event.target.value) : null
                      )
                    }
                    aria-label="Кабинет"
                  >
                    <option value="">Онлайн</option>
                    {studioClassrooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="slot-remove"
                    onClick={() => removeSlot(index)}
                    disabled={slots.length === 1}
                    title={
                      slots.length === 1
                        ? 'В шаблоне должен остаться хотя бы один день'
                        : 'Удалить день'
                    }
                    aria-label="Удалить день"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-slot-button"
              onClick={addSlot}
              disabled={slots.length >= MAX_SLOTS}
            >
              + Добавить день
            </button>
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
                      checked={studentIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
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
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Дополнительная информация..."
              rows={2}
            />
          </div>

          {/* Предпросмотр */}
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Что получится сейчас</h3>
              {preview && (
                <span className="preview-horizon">
                  до {formatHumanDate(preview.horizon_end)}
                </span>
              )}
            </div>

            {validationError ? (
              <p className="preview-placeholder">{validationError}</p>
            ) : isPreviewLoading && !preview ? (
              <p className="preview-placeholder">Считаем...</p>
            ) : preview ? (
              <>
                <div
                  className={`preview-stats ${isPreviewLoading ? 'stale' : ''}`}
                >
                  <div className="preview-stat">
                    <span className="preview-stat-label">Будет создано</span>
                    <span className="preview-stat-value">
                      {preview.will_create_count}
                    </span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-label">Уже есть</span>
                    <span className="preview-stat-value">
                      {preview.already_exists_count}
                    </span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-label">Конфликтов</span>
                    <span
                      className={`preview-stat-value ${
                        preview.blocked_count > 0 ? 'warning' : ''
                      }`}
                    >
                      {preview.blocked_count}
                    </span>
                  </div>
                </div>

                <p className="preview-hint">
                  Занятия создаются на две недели вперёд, дальше расписание
                  продлевается автоматически
                </p>

                {preview.conflicts.length > 0 && (
                  <div className="preview-conflicts">
                    {visibleConflicts.map((conflict, index) => (
                      <div className="preview-conflict" key={index}>
                        <span className="conflict-date">
                          {formatHumanDate(conflict.lesson_date)},{' '}
                          {conflict.start_time.slice(0, 5)}
                        </span>
                        <span className="conflict-message">
                          {conflict.message}
                          {conflict.kind === 'classroom' &&
                            conflict.classroom_id &&
                            ` (${
                              classroomNameById.get(conflict.classroom_id) ??
                              `кабинет ${conflict.classroom_id}`
                            })`}
                        </span>
                      </div>
                    ))}

                    {preview.conflicts.length > MAX_VISIBLE_CONFLICTS && (
                      <button
                        type="button"
                        className="conflicts-toggle"
                        onClick={() => setShowAllConflicts((prev) => !prev)}
                      >
                        {showAllConflicts
                          ? 'Свернуть'
                          : `Показать ещё ${
                              preview.conflicts.length - MAX_VISIBLE_CONFLICTS
                            }`}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="preview-placeholder">
                Заполните форму, чтобы увидеть расчёт
              </p>
            )}
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
              disabled={isSubmitting || Boolean(validationError)}
            >
              {submitLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatternFormModal;