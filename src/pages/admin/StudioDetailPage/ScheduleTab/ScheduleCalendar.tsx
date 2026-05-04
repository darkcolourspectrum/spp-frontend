/**
 * ScheduleCalendar - time-grid представление расписания студии.
 *
 * Layout: 6 колонок (Пн-Сб), слева шкала времени 09:00-21:00 шагом 30 мин.
 * Час = 60px по вертикали. Занятия рендерятся как абсолютно
 * позиционированные блоки внутри колонки своего дня:
 *   top    = (start - 09:00) в минутах * (60 / 60) px
 *   height = duration в минутах * (60 / 60) px
 *
 * Наложения занятий в одном дне разруливаются упрощенно: каждое
 * занятие в группе пересекающихся получает width = 100/N% и left = i*100/N%.
 */

import { useMemo, useState, useEffect } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import CancelLessonModal from './CancelLessonModal';
import RescheduleLessonModal from './RescheduleLessonModal';
import './scheduleCalendar.css';

interface ScheduleCalendarProps {
  lessons: ScheduleLessonItem[];
  studioId: number;
  isLoading: boolean;
  isReadOnly?: boolean;
}

// Конфиг сетки
const STUDIO_OPEN_HOUR = 9;     // 09:00
const STUDIO_CLOSE_HOUR = 21;   // 21:00
const HOUR_HEIGHT_PX = 60;
const MINUTE_HEIGHT_PX = HOUR_HEIGHT_PX / 60;
const SLOT_MINUTES = 30;        // шаг линий сетки

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// ====== Date helpers ======

/** Понедельник недели, в которую попадает date (локальное время). */
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Воскресенье - откатываемся на 6 назад
  d.setDate(d.getDate() + diff);
  return d;
};

/** YYYY-MM-DD в локальной зоне (без UTC-сдвига). */
const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatRangeLabel = (monday: Date): string => {
  const saturday = addDays(monday, 5);
  const monthsFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
  const sameMonth = monday.getMonth() === saturday.getMonth();
  if (sameMonth) {
    return `${monday.getDate()}-${saturday.getDate()} ${monthsFmt.format(monday)} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${monthsFmt.format(monday)} - ${saturday.getDate()} ${monthsFmt.format(saturday)} ${saturday.getFullYear()}`;
};

// ====== Time helpers ======

/** "HH:MM:SS" или "HH:MM" -> минут от полуночи. */
const timeToMinutes = (time: string): number => {
  const parts = time.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
};

const trimSeconds = (t: string): string => (t.length >= 5 ? t.slice(0, 5) : t);

// ====== Overlap layout ======

interface PositionedLesson {
  lesson: ScheduleLessonItem;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
}

/**
 * Распределяет занятия одного дня по горизонтали с учётом пересечений.
 * Алгоритм: сортируем по start_time, для каждого занятия ищем "колонку"
 * где оно не пересекается с уже размещенным; ширина дня делится на
 * максимальное число параллельных колонок.
 */
const layoutDay = (dayLessons: ScheduleLessonItem[]): PositionedLesson[] => {
  const sorted = [...dayLessons].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  // columns[i] = массив занятий в i-й колонке
  const columns: ScheduleLessonItem[][] = [];
  const columnIndex = new Map<number, number>(); // lesson_id -> col idx

  for (const lesson of sorted) {
    const startMin = timeToMinutes(lesson.start_time);
    const endMin = timeToMinutes(lesson.end_time);

    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const last = columns[i][columns[i].length - 1];
      const lastEnd = timeToMinutes(last.end_time);
      if (lastEnd <= startMin) {
        columns[i].push(lesson);
        columnIndex.set(lesson.lesson_id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([lesson]);
      columnIndex.set(lesson.lesson_id, columns.length - 1);
    }
    // Переменная endMin зарезервирована для возможного расширения
    void endMin;
  }

  const totalCols = columns.length || 1;
  const colWidthPercent = 100 / totalCols;

  return sorted.map((lesson) => {
    const startMin = timeToMinutes(lesson.start_time);
    const endMin = timeToMinutes(lesson.end_time);
    const dayStartMin = STUDIO_OPEN_HOUR * 60;
    const col = columnIndex.get(lesson.lesson_id) ?? 0;

    return {
      lesson,
      top: (startMin - dayStartMin) * MINUTE_HEIGHT_PX,
      height: (endMin - startMin) * MINUTE_HEIGHT_PX,
      leftPercent: col * colWidthPercent,
      widthPercent: colWidthPercent,
    };
  });
};

// ====== Component ======

const ScheduleCalendar = ({
  lessons,
  studioId,
  isLoading,
  isReadOnly = false,
}: ScheduleCalendarProps) => {
  const { user, isAdmin } = useAuth();
  const { filters, updateDateRange } = useSchedule();

  const [lessonToCancel, setLessonToCancel] =
    useState<ScheduleLessonItem | null>(null);
  const [lessonToReschedule, setLessonToReschedule] =
    useState<ScheduleLessonItem | null>(null);
    // Текущее время (для линии "сейчас"). Обновляется раз в минуту.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    
    return () => clearInterval(id);
  }, []);

  // Парсим текущий "Пн" из фильтров (от него считаем 6 дней вперед).
  const currentMonday = useMemo(() => {
    const [y, m, d] = filters.fromDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [filters.fromDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => addDays(currentMonday, i));
  }, [currentMonday]);

  // Группируем занятия по дате
  const lessonsByDate = useMemo(() => {
    const map: Record<string, ScheduleLessonItem[]> = {};
    for (const lesson of lessons) {
      if (!map[lesson.lesson_date]) map[lesson.lesson_date] = [];
      map[lesson.lesson_date].push(lesson);
    }
    return map;
  }, [lessons]);

  // Часы для шкалы слева (09, 10, ..., 21)
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = STUDIO_OPEN_HOUR; h <= STUDIO_CLOSE_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  // Проверка прав на управление занятием
  const todayStr = formatLocalDate(new Date());
  const currentUserId = user?.id;
  const canManageLesson = (lesson: ScheduleLessonItem): boolean => {
    if (isReadOnly) return false;
    if (lesson.status !== 'scheduled') return false;
    if (lesson.lesson_date < todayStr) return false;
    if (isAdmin()) return true;
    return lesson.teacher_id === currentUserId;
  };

  // Навигация недель
  const shiftWeek = (offsetDays: number) => {
    const newMonday = addDays(currentMonday, offsetDays);
    const newSaturday = addDays(newMonday, 5);
    updateDateRange(formatLocalDate(newMonday), formatLocalDate(newSaturday));
  };

  const goToToday = () => {
    const monday = getMonday(new Date());
    const saturday = addDays(monday, 5);
    updateDateRange(formatLocalDate(monday), formatLocalDate(saturday));
  };

  const totalGridHeight =
    (STUDIO_CLOSE_HOUR - STUDIO_OPEN_HOUR) * HOUR_HEIGHT_PX;

  // Позиция "линии сейчас" в пикселях от начала сетки и индекс
  // колонки текущего дня (0-5 для Пн-Сб, или -1 если сегодня воскресенье).
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMin = STUDIO_OPEN_HOUR * 60;
  const dayEndMin = STUDIO_CLOSE_HOUR * 60;
  const showNowLine = nowMinutes >= dayStartMin && nowMinutes <= dayEndMin;
  const nowLineTop = (nowMinutes - dayStartMin) * MINUTE_HEIGHT_PX;

  const todayDayIdx = weekDays.findIndex(
    (d) => formatLocalDate(d) === todayStr
  );

  return (
    <div className="schedule-calendar">
      {/* Toolbar */}
      <div className="calendar-toolbar">
        <div className="toolbar-nav">
          <button
            type="button"
            className="nav-btn"
            onClick={() => shiftWeek(-7)}
            title="Предыдущая неделя"
          >
            ←
          </button>
          <button type="button" className="nav-btn today-btn" onClick={goToToday}>
            Сегодня
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => shiftWeek(7)}
            title="Следующая неделя"
          >
            →
          </button>
        </div>
        <div className="toolbar-range">{formatRangeLabel(currentMonday)}</div>
      </div>

      {/* Header с днями недели */}
      <div className="calendar-header">
        <div className="header-time-col" />
        {weekDays.map((day, idx) => {
          const dayStr = formatLocalDate(day);
          const isToday = dayStr === todayStr;
          return (
            <div
              key={dayStr}
              className={`header-day ${isToday ? 'is-today' : ''}`}
            >
              <div className="header-day-label">{WEEKDAY_LABELS[idx]}</div>
              <div className="header-day-number">{day.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="calendar-body">
        {/* Колонка времени слева */}
        <div className="time-column" style={{ height: totalGridHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              className="time-mark"
              style={{ top: (h - STUDIO_OPEN_HOUR) * HOUR_HEIGHT_PX }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Колонки дней */}
        <div className="days-grid" style={{ height: totalGridHeight }}>
          {/* Линия "сейчас" - только если сегодняшний день в этой неделе
              и текущее время в пределах рабочих часов */}
          {showNowLine && todayDayIdx >= 0 && (
            <div
              className="now-line"
              style={{
                top: nowLineTop,
                left: `calc(${(todayDayIdx * 100) / 6}%)`,
                width: `calc(${100 / 6}%)`,
              }}
            >
              <div className="now-line-dot" />
            </div>
          )}
          {/* Горизонтальные линии сетки */}
          <div className="grid-lines">
            {Array.from(
              {
                length:
                  ((STUDIO_CLOSE_HOUR - STUDIO_OPEN_HOUR) * 60) / SLOT_MINUTES +
                  1,
              },
              (_, i) => {
                const isHour = (i * SLOT_MINUTES) % 60 === 0;
                return (
                  <div
                    key={i}
                    className={`grid-line ${isHour ? 'hour' : 'half-hour'}`}
                    style={{ top: i * SLOT_MINUTES * MINUTE_HEIGHT_PX }}
                  />
                );
              }
            )}
          </div>

          {/* 6 колонок дней */}
          {weekDays.map((day) => {
            const dayStr = formatLocalDate(day);
            const dayLessons = lessonsByDate[dayStr] || [];
            const positioned = layoutDay(dayLessons);
            const isToday = dayStr === todayStr;

            return (
              <div key={dayStr} className={`day-column ${isToday ? 'is-today' : ''}`}>
                {positioned.map(({ lesson, top, height, leftPercent, widthPercent }) => (
                  <div
                    key={lesson.lesson_id}
                    className={`lesson-block status-${lesson.status}`}
                    style={{
                      top,
                      height,
                      left: `calc(${leftPercent}% + 2px)`,
                      width: `calc(${widthPercent}% - 4px)`,
                    }}
                  >
                    {canManageLesson(lesson) && (
                      <div className="lesson-block-actions">
                        <button
                          type="button"
                          className="lesson-action-btn reschedule"
                          title="Перенести"
                          onClick={() => setLessonToReschedule(lesson)}
                        >
                          ↻
                        </button>
                        <button
                          type="button"
                          className="lesson-action-btn cancel"
                          title="Отменить"
                          onClick={() => setLessonToCancel(lesson)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="lesson-block-time">
                      {trimSeconds(lesson.start_time)}-{trimSeconds(lesson.end_time)}
                    </div>
                    <div className="lesson-block-title">{lesson.teacher_name}</div>
                    {lesson.classroom_name && (
                      <div className="lesson-block-meta">{lesson.classroom_name}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && <div className="calendar-loading-overlay">Загрузка...</div>}

      {lessonToCancel && (
        <CancelLessonModal
          lesson={lessonToCancel}
          studioId={studioId}
          onClose={() => setLessonToCancel(null)}
        />
      )}

      {lessonToReschedule && (
        <RescheduleLessonModal
          lesson={lessonToReschedule}
          studioId={studioId}
          onClose={() => setLessonToReschedule(null)}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;