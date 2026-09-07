/**
 * ScheduleCalendar - недельная сетка расписания студии.
 *
 * Шесть колонок, Пн-Сб: воскресенье в SCHEDULE_WORKING_DAYS не входит.
 * Слева шкала часов, час равен HOUR_HEIGHT_PX по вертикали, занятия -
 * абсолютно позиционированные блоки внутри колонки своего дня.
 *
 * Границы шкалы подвижны. По умолчанию это рабочее окно студии, но если
 * в загруженной неделе есть занятие за его пределами, сетка растягивается:
 * занятие, которого нет на экране, но есть в базе, найти нечем.
 *
 * Наложения разруливаются группами. День режется на связные пачки
 * пересекающихся занятий, и ширина делится внутри каждой пачки отдельно -
 * иначе одна пара пересечений утром ужимала бы вдвое одинокое занятие
 * вечером.
 *
 * Отменённые занятия в раскладке не участвуют вовсе. Отмена освобождает
 * слот, и конкурировать за место такому занятию не за что: оно рисуется
 * тонкой полоской в жёлобе у левого края, а вернуть его в расписание
 * можно из карточки.
 *
 * Клик по пустому месту создаёт занятие на этом времени, клик по
 * занятию открывает карточку.
 */

import { useMemo, useState, useEffect } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import CancelLessonModal from './CancelLessonModal';
import RescheduleLessonModal from './RescheduleLessonModal';
import CreateLessonModal from './CreateLessonModal';
import LessonCard from '@/modules/schedule/components/LessonCard/LessonCard';
import ScheduleLegend from './ScheduleLegend';
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
// Место под подпись последнего часа: она стоит на нижней границе сетки
// и без запаса обрезается.
const GRID_TAIL_PX = 20;

// Отменённые занятия рисуются полосками в жёлобе у левого края, а не
// блоками: слот освобождён, занятия там нет, и делить ширину с реальным
// занятием ему не за что.
const CANCELLED_STRIPE_PX = 6;
const CANCELLED_GAP_PX = 2;
// Просвет сверху и снизу, чтобы соседние по времени полоски
// не сливались в одну сплошную линию.
const CANCELLED_INSET_PX = 2;

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAYS_IN_WEEK = 6;

// Сетка показывает шесть дней, но соседняя неделя всё равно в семи днях:
// сдвиг на шесть сломал бы выравнивание по понедельнику.
const WEEK_STRIDE_DAYS = 7;

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
  /** Готовые CSS-значения: жёлоб в пикселях, колонки в процентах. */
  left: string;
  width: string;
  variant: 'active' | 'cancelled';
}

/**
 * Распределяет занятия одного дня по горизонтали с учётом пересечений.
 *
 * Работает в два прохода. Сначала день режется на группы: занятия
 * попадают в одну группу, если их интервалы соприкасаются хотя бы
 * через цепочку соседей. Затем внутри каждой группы отдельно считаются
 * колонки, и ширина делится только на них.
 *
 *
 * Отменённые и активные раскладываются независимо. Отменённые уходят
 * в узкий жёлоб слева отдельными полосками. Жёлоб местный, а не на весь
 * день: место под полоски резервируется только у тех групп занятий,
 * под которыми полоски действительно есть - иначе четыре отмены
 * в шесть вечера сдвигали бы вправо занятие в час дня.
 */
interface LayoutGroup {
  lessons: ScheduleLessonItem[];
  columnIndex: Map<number, number>;
  columnCount: number;
}

/**
 * Режет список на группы пересекающихся занятий и раскладывает каждую
 * по колонкам. Группа заканчивается там, где очередное занятие
 * начинается не раньше конца всей текущей группы.
 */
const buildGroups = (lessons: ScheduleLessonItem[]): LayoutGroup[] => {
  const sorted = [...lessons].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const groups: LayoutGroup[] = [];
  let current: ScheduleLessonItem[] = [];
  let groupEndMin = -1;

  const flush = () => {
    if (current.length === 0) return;

    const columns: ScheduleLessonItem[][] = [];
    const columnIndex = new Map<number, number>();

    for (const lesson of current) {
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

    groups.push({
      lessons: current,
      columnIndex,
      columnCount: columns.length || 1,
    });
    current = [];
    groupEndMin = -1;
  };

  for (const lesson of sorted) {
    const startMin = timeToMinutes(lesson.start_time);
    const endMin = timeToMinutes(lesson.end_time);

    if (current.length > 0 && startMin >= groupEndMin) flush();

    current.push(lesson);
    groupEndMin = Math.max(groupEndMin, endMin);
  }
  flush();

  return groups;
};

/**
 * Раскладка занятий одного дня.
 *
 * Отменённые и активные раскладываются независимо. Отменённые уходят
 * в узкий жёлоб слева отдельными полосками: слот освобождён, занятия
 * там нет, и делить ширину с реальным занятием ему не за что. Ширина
 * жёлоба считается по самому плотному наложению за день, чтобы активные
 * занятия не прыгали по горизонтали в разные часы.
 *
 * Раньше колонки считались на весь день сразу, и одной пары пересечений
 * утром хватало, чтобы одинокое вечернее занятие тоже ужалось вдвое.
 */
const layoutDay = (
  dayLessons: ScheduleLessonItem[],
  gridStartHour: number
): PositionedLesson[] => {
  const dayStartMin = gridStartHour * 60;

  const geometry = (lesson: ScheduleLessonItem) => ({
    top: (timeToMinutes(lesson.start_time) - dayStartMin) * MINUTE_HEIGHT_PX,
    height:
      (timeToMinutes(lesson.end_time) - timeToMinutes(lesson.start_time)) *
      MINUTE_HEIGHT_PX,
  });

  const cancelledGroups = buildGroups(
    dayLessons.filter((l) => l.status === 'cancelled')
  );
  const activeGroups = buildGroups(
    dayLessons.filter((l) => l.status !== 'cancelled')
  );

    const stripeStep = CANCELLED_STRIPE_PX + CANCELLED_GAP_PX;
  const positioned: PositionedLesson[] = [];

  // Полоски отменённых. Заодно запоминаем их интервалы и колонки:
  // по ним ниже считается, кому из активных занятий жёлоб вообще нужен.
  const stripes: { startMin: number; endMin: number; col: number }[] = [];

  for (const group of cancelledGroups) {
    for (const lesson of group.lessons) {
      const col = group.columnIndex.get(lesson.lesson_id) ?? 0;
      const geo = geometry(lesson);

      stripes.push({
        startMin: timeToMinutes(lesson.start_time),
        endMin: timeToMinutes(lesson.end_time),
        col,
      });

      positioned.push({
        lesson,
        top: geo.top + CANCELLED_INSET_PX,
        height: Math.max(geo.height - CANCELLED_INSET_PX * 2, 4),
        left: `${col * stripeStep}px`,
        width: `${CANCELLED_STRIPE_PX}px`,
        variant: 'cancelled',
      });
    }
  }

  for (const group of activeGroups) {
    const groupStart = Math.min(
      ...group.lessons.map((l) => timeToMinutes(l.start_time))
    );
    const groupEnd = Math.max(
      ...group.lessons.map((l) => timeToMinutes(l.end_time))
    );

    // Жёлоб местный, а не на весь день: место под полоски резервируется
    // только там, где полоски действительно есть. Иначе четыре отмены
    // в шесть вечера сдвигали бы вправо занятие в час дня.
    const overlapping = stripes.filter(
      (stripe) => stripe.startMin < groupEnd && groupStart < stripe.endMin
    );
    const gutterPx = overlapping.length
      ? (Math.max(...overlapping.map((s) => s.col)) + 1) * stripeStep
      : 0;

    const fraction = 1 / group.columnCount;

    for (const lesson of group.lessons) {
      const col = group.columnIndex.get(lesson.lesson_id) ?? 0;
      positioned.push({
        lesson,
        ...geometry(lesson),
        left: `calc(${gutterPx}px + (100% - ${gutterPx}px) * ${
          col * fraction
        } + 2px)`,
        width: `calc((100% - ${gutterPx}px) * ${fraction} - 4px)`,
        variant: 'active',
      });
    }
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

  /**
   * Границы сетки по вертикали.
   *
   * Рабочие часы студии - лишь значение по умолчанию. Если занятие
   * оказалось за их пределами, сетка растягивается, чтобы его было
   * видно: занятие, которого нет на экране, но есть в базе, найти
   * нечем, и это хуже некрасивой сетки.
   *
   * Объявлено выше hours не случайно: у const нет подъёма, и обращение
   * к этим значениям из хука, стоящего раньше в файле, роняет весь
   * компонент при первом же рендере.
   */
  const { gridStartHour, gridEndHour } = useMemo(() => {
    let start = STUDIO_OPEN_HOUR;
    let end = STUDIO_CLOSE_HOUR;

    for (const lesson of lessons) {
      start = Math.min(
        start,
        Math.floor(timeToMinutes(lesson.start_time) / 60)
      );
      end = Math.max(end, Math.ceil(timeToMinutes(lesson.end_time) / 60));
    }

    return { gridStartHour: start, gridEndHour: end };
  }, [lessons]);

  const totalGridHeight =
    (gridEndHour - gridStartHour) * HOUR_HEIGHT_PX + GRID_TAIL_PX;

  // Часы для шкалы слева (по фактическим границам сетки)
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = gridStartHour; h <= gridEndHour; h++) arr.push(h);
    return arr;
  }, [gridStartHour, gridEndHour]);

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

    const maxStart = (gridEndHour - gridStartHour) * 60 - SLOT_MINUTES;
    const clamped = Math.min(Math.max(snapped, 0), maxStart);
    const totalMinutes = gridStartHour * 60 + clamped;

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

  // Позиция "линии сейчас" в пикселях от начала сетки и индекс
  // колонки текущего дня.
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMin = gridStartHour * 60;
  const dayEndMin = gridEndHour * 60;
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
            onClick={() => shiftWeek(-WEEK_STRIDE_DAYS)}
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
            onClick={() => shiftWeek(WEEK_STRIDE_DAYS)}
            title="Следующая неделя"
          >
            →
          </button>
        </div>
        <ScheduleLegend />
        <div className="toolbar-range">{formatRangeLabel(currentMonday)}</div>
      </div>

      {/* Header с днями недели */}
      <div className="calendar-header">
        <div className="header-time-col"></div>
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
              style={{ top: (h - gridStartHour) * HOUR_HEIGHT_PX }}
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
                  ((gridEndHour - gridStartHour) * 60) / SLOT_MINUTES +
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
            const positioned = layoutDay(dayLessons, gridStartHour);
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
                  ({ lesson, top, height, left, width, variant }) => (
                    <div
                      key={lesson.lesson_id}
                      className={`lesson-block status-${lesson.status}${
                        variant === 'cancelled' ? ' is-marker' : ''
                      }${
                        lesson.has_ended && lesson.status === 'scheduled'
                          ? ' needs-review'
                          : ''
                      }`}
                      style={{ top, height, left, width }}
                      title={
                        variant === 'cancelled'
                          ? `Отменено ${trimSeconds(
                              lesson.start_time
                            )}-${trimSeconds(lesson.end_time)}, ${
                              lesson.teacher_name
                            }`
                          : undefined
                      }
                      onClick={() => setOpenLessonId(lesson.lesson_id)}
                    >
                      {variant === 'active' && (
                        <>
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
                        </>
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