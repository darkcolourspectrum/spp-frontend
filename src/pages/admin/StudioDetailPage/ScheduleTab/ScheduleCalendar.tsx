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
 *
 * Что изменилось в этой версии:
 *
 *   1. Появилось воскресенье. Раньше сетка рисовала шесть колонок, Пн-Сб.
 *      Шаблон при этом мог иметь слот на воскресенье, занятия создавались
 *      и жили в базе, но в календаре их не было видно вообще.
 *
 *   2. Клик по пустому месту создаёт занятие на этом слоте. Раньше
 *      единственным входом была кнопка в шапке, открывавшая форму
 *      с датой "сегодня" и временем 10:00 - нужный слот приходилось
 *      вбивать руками, глядя на сетку.
 *
 *   3. Отменённое занятие можно вернуть в расписание кнопкой на блоке.
 */

import { useMemo, useState, useEffect } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { restoreLesson } from '@/modules/schedule/store/scheduleSlice/actionCreators';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import CancelLessonModal from './CancelLessonModal';
import RescheduleLessonModal from './RescheduleLessonModal';
import CreateLessonModal from './CreateLessonModal';
import LessonCard from './LessonCard';
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
const DAYS_IN_WEEK = 6;

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
  const lastDay = addDays(monday, DAYS_IN_WEEK - 1);
  const monthsFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
  const sameMonth = monday.getMonth() === lastDay.getMonth();
  if (sameMonth) {
    return `${monday.getDate()}-${lastDay.getDate()} ${monthsFmt.format(monday)} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${monthsFmt.format(monday)} - ${lastDay.getDate()} ${monthsFmt.format(lastDay)} ${lastDay.getFullYear()}`;
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
/**
 * Распределяет занятия одного дня по горизонтали с учётом пересечений.
 *
 * Работает в два прохода. Сначала день режется на группы: занятия
 * попадают в одну группу, если их интервалы соприкасаются хотя бы
 * через цепочку соседей. Затем внутри каждой группы отдельно считаются
 * колонки, и ширина делится только на них.
 *
 * Раньше колонки считались на весь день сразу, и ширина по максимуму
 * применялась ко всем занятиям подряд. Одной пары пересечений в девять
 * утра хватало, чтобы одинокое занятие в шесть вечера тоже ужалось
 * вдвое.
 *
 * Отменённые занятия в раскладке не участвуют: отмена освобождает слот,
 * и такое занятие ни с чем не конкурирует за место. Оно рисуется на всю
 * ширину и уезжает назад по z-index, а активные раскладываются так,
 * будто его нет.
 */
const layoutDay = (dayLessons: ScheduleLessonItem[]): PositionedLesson[] => {
  const dayStartMin = STUDIO_OPEN_HOUR * 60;

  const geometry = (lesson: ScheduleLessonItem) => {
    const startMin = timeToMinutes(lesson.start_time);
    const endMin = timeToMinutes(lesson.end_time);
    return {
      top: (startMin - dayStartMin) * MINUTE_HEIGHT_PX,
      height: (endMin - startMin) * MINUTE_HEIGHT_PX,
    };
  };

  const cancelled = dayLessons.filter((l) => l.status === 'cancelled');
  const active = [...dayLessons]
    .filter((l) => l.status !== 'cancelled')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const positioned: PositionedLesson[] = [];

  // Проход первый: режем день на группы пересекающихся занятий.
  // Занятия отсортированы по началу, поэтому группа заканчивается там,
  // где очередное занятие стартует не раньше конца всей текущей группы.
  let group: ScheduleLessonItem[] = [];
  let groupEndMin = -1;

  const flushGroup = () => {
    if (group.length === 0) return;

    // Проход второй: колонки внутри группы. Занятие садится в первую
    // колонку, где не пересекается с последним её жильцом.
    const columns: ScheduleLessonItem[][] = [];
    const columnIndex = new Map<number, number>();

    for (const lesson of group) {
      const startMin = timeToMinutes(lesson.start_time);
      let placed = false;

      for (let i = 0; i < columns.length; i++) {
        const last = columns[i][columns[i].length - 1];
        if (timeToMinutes(last.end_time) <= startMin) {
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
    }

    const colWidthPercent = 100 / (columns.length || 1);

    for (const lesson of group) {
      const col = columnIndex.get(lesson.lesson_id) ?? 0;
      positioned.push({
        lesson,
        ...geometry(lesson),
        leftPercent: col * colWidthPercent,
        widthPercent: colWidthPercent,
      });
    }

    group = [];
    groupEndMin = -1;
  };

  for (const lesson of active) {
    const startMin = timeToMinutes(lesson.start_time);
    const endMin = timeToMinutes(lesson.end_time);

    if (group.length > 0 && startMin >= groupEndMin) {
      flushGroup();
    }

    group.push(lesson);
    groupEndMin = Math.max(groupEndMin, endMin);
  }
  flushGroup();

  for (const lesson of cancelled) {
    positioned.push({
      lesson,
      ...geometry(lesson),
      leftPercent: 0,
      widthPercent: 100,
    });
  }

  return positioned;
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
  const dispatch = useAppDispatch();

  const [lessonToCancel, setLessonToCancel] =
    useState<ScheduleLessonItem | null>(null);
  const [lessonToReschedule, setLessonToReschedule] =
    useState<ScheduleLessonItem | null>(null);

  // Слот, по которому кликнули для создания занятия
  const [newLessonSlot, setNewLessonSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);

  // Занятие, открытое в карточке. Храним id, а не объект: карточка
  // грузит данные сама, и ей достаточно одного числа.
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  // Текущее время (для линии "сейчас"). Обновляется раз в минуту.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);

    return () => clearInterval(id);
  }, []);

  // Парсим текущий "Пн" из фильтров (от него считаем 7 дней вперед).
  const currentMonday = useMemo(() => {
    const [y, m, d] = filters.fromDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [filters.fromDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(currentMonday, i));
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
    // Перенос и отмена - планирование. Прошедшее занятие планировать
    // поздно, сервер такой запрос отклонит.
    if (lesson.has_ended) return false;
    if (isAdmin()) return true;
    return lesson.teacher_id === currentUserId;
  };

  /**
   * Отменённое занятие можно вернуть в расписание.
   * canManageLesson для него false - у отменённого другие действия.
   */
  const canRestoreLesson = (lesson: ScheduleLessonItem): boolean => {
    if (isReadOnly) return false;
    if (lesson.status !== 'cancelled') return false;
    // По времени не ограничиваем: возврат - это исправление ошибки.
    // Занятие, отменённое по ошибке, надо уметь вернуть и отметить
    // проведённым, а прямой переход cancelled -> completed запрещён.
    if (isAdmin()) return true;
    return lesson.teacher_id === currentUserId;
  };

  const handleRestore = (lesson: ScheduleLessonItem) => {
    // Сервер проверит конфликты заново: пока занятие было отменено,
    // его время считалось свободным и могло быть занято.
    dispatch(restoreLesson(lesson.lesson_id));
  };

  /**
   * Клик по пустому месту в колонке дня создаёт занятие.
   *
   * Время берётся из координаты клика и округляется вниз до получаса,
   * чтобы занятия ложились на линии сетки.
   */
  const handleGridClick = (
    event: React.MouseEvent<HTMLDivElement>,
    dayStr: string
  ) => {
    if (isReadOnly) return;
    if (dayStr < todayStr) return;

    // Клик пришёлся на существующее занятие - это не создание нового.
    if ((event.target as HTMLElement).closest('.lesson-block')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const minutesFromOpen = (event.clientY - rect.top) / MINUTE_HEIGHT_PX;
    const snapped = Math.floor(minutesFromOpen / SLOT_MINUTES) * SLOT_MINUTES;

    const maxStart = (STUDIO_CLOSE_HOUR - STUDIO_OPEN_HOUR) * 60 - SLOT_MINUTES;
    const clamped = Math.min(Math.max(snapped, 0), maxStart);
    const totalMinutes = STUDIO_OPEN_HOUR * 60 + clamped;

    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');

    setNewLessonSlot({ date: dayStr, time: `${hh}:${mm}` });
  };

  // Навигация недель
  const shiftWeek = (offsetDays: number) => {
    const newMonday = addDays(currentMonday, offsetDays);
    const newLastDay = addDays(newMonday, DAYS_IN_WEEK - 1);
    updateDateRange(formatLocalDate(newMonday), formatLocalDate(newLastDay));
  };

  const goToToday = () => {
    const monday = getMonday(new Date());
    const lastDay = addDays(monday, DAYS_IN_WEEK - 1);
    updateDateRange(formatLocalDate(monday), formatLocalDate(lastDay));
  };

  const totalGridHeight =
    (STUDIO_CLOSE_HOUR - STUDIO_OPEN_HOUR) * HOUR_HEIGHT_PX;

  // Позиция "линии сейчас" в пикселях от начала сетки и индекс
  // колонки текущего дня.
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMin = STUDIO_OPEN_HOUR * 60;
  const dayEndMin = STUDIO_CLOSE_HOUR * 60;
  const showNowLine = nowMinutes >= dayStartMin && nowMinutes <= dayEndMin;
  const nowLineTop = (nowMinutes - dayStartMin) * MINUTE_HEIGHT_PX;

  const todayDayIdx = weekDays.findIndex((d) => formatLocalDate(d) === todayStr);

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
                left: `calc(${(todayDayIdx * 100) / DAYS_IN_WEEK}%)`,
                width: `calc(${100 / DAYS_IN_WEEK}%)`,
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

          {/* Колонки дней */}
          {weekDays.map((day) => {
            const dayStr = formatLocalDate(day);
            const dayLessons = lessonsByDate[dayStr] || [];
            const positioned = layoutDay(dayLessons);
            const isToday = dayStr === todayStr;
            const isClickable = !isReadOnly && dayStr >= todayStr;

            return (
              <div
                key={dayStr}
                className={`day-column ${isToday ? 'is-today' : ''} ${
                  isClickable ? 'clickable' : ''
                }`}
                onClick={(event) => handleGridClick(event, dayStr)}
                title={
                  isClickable ? 'Нажмите, чтобы создать занятие' : undefined
                }
              >
                {positioned.map(
                  ({ lesson, top, height, leftPercent, widthPercent }) => (
                    <div
                      key={lesson.lesson_id}
                      className={`lesson-block status-${lesson.status}`}
                      style={{
                        top,
                        height,
                        left: `calc(${leftPercent}% + 2px)`,
                        width: `calc(${widthPercent}% - 4px)`,
                      }}
                      onClick={() => setOpenLessonId(lesson.lesson_id)}
                    >
                      {canManageLesson(lesson) && (
                        <div
                          className="lesson-block-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
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

                      {canRestoreLesson(lesson) && (
                        <div
                          className="lesson-block-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="lesson-action-btn restore"
                            title="Вернуть в расписание"
                            onClick={() => handleRestore(lesson)}
                          >
                            ↺
                          </button>
                        </div>
                      )}

                      <div className="lesson-block-time">
                        {trimSeconds(lesson.start_time)}-
                        {trimSeconds(lesson.end_time)}
                      </div>
                      <div className="lesson-block-title">
                        {lesson.teacher_name}
                      </div>
                      {lesson.classroom_name && (
                        <div className="lesson-block-meta">
                          {lesson.classroom_name}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && <div className="calendar-loading-overlay">Загрузка...</div>}

      {newLessonSlot && (
        <CreateLessonModal
          studioId={studioId}
          teacherId={isAdmin() ? undefined : currentUserId}
          initialDate={newLessonSlot.date}
          initialTime={newLessonSlot.time}
          onClose={() => setNewLessonSlot(null)}
        />
      )}

      {openLessonId !== null && (
        <LessonCard
          lessonId={openLessonId}
          onClose={() => setOpenLessonId(null)}
        />
      )}

      {lessonToCancel && (
        <CancelLessonModal
          lesson={lessonToCancel}
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