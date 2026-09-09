/**
 * ScheduleListView - просмотр расписания списком по дням.
 *
 * Общий презентационный компонент для страниц расписания студента и
 * преподавателя. Занятия приходят готовыми - грузит их страница-обёртка
 * через useSchedule.
 *
 * Клик по занятию открывает карточку. Она самодостаточна: принимает
 * только lessonId и грузит детали сама, поэтому одинаково работает
 * и здесь, и в сетке студии. Действия внутри неё сами разбираются
 * с правами, ученику кнопок не покажут.
 *
 * Занятия группируются по датам и сортируются по времени. Для
 * преподавателя в строке показываем учеников, для студента -
 * преподавателя. Чем именно подписывать строку, решает проп subtitleMode.
 */

import { useMemo, useState } from 'react';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import LessonCard from '@/modules/schedule/components/LessonCard/LessonCard';
import { lessonStatusLabel } from '@/api/schedule/types';
import './scheduleListView.css';

interface ScheduleListViewProps {
  lessons: ScheduleLessonItem[];
  isLoading: boolean;
  fromDate: string;
  toDate: string;
  // 'teacher' - в строке показываем учеников; 'student' - преподавателя.
  subtitleMode: 'teacher' | 'student';
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

const WEEKDAYS = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
  'Четверг', 'Пятница', 'Суббота',
];

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const trimSeconds = (t: string): string => (t && t.length >= 5 ? t.slice(0, 5) : t);

/** 'YYYY-MM-DD' -> 'Понедельник, 2 июня' */
const formatDayHeader = (isoDate: string): string => {
  const d = new Date(isoDate + 'T00:00:00');
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** 'YYYY-MM-DD' -> 'D MMM' (для диапазона в шапке) */
const formatShort = (isoDate: string): string => {
  const d = new Date(isoDate + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const isToday = (isoDate: string): boolean => {
  const today = new Date();
  const d = new Date(isoDate + 'T00:00:00');
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const ScheduleListView = ({
  lessons,
  isLoading,
  fromDate,
  toDate,
  subtitleMode,
  onPrevWeek,
  onNextWeek,
  onToday,
}: ScheduleListViewProps) => {

  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  // Группировка по дате + сортировка занятий внутри дня по времени.
  const groupedByDate = useMemo(() => {
    const grouped: Record<string, ScheduleLessonItem[]> = {};
    for (const lesson of lessons) {
      (grouped[lesson.lesson_date] ||= []).push(lesson);
    }
    for (const date of Object.keys(grouped)) {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return grouped;
  }, [lessons]);

  // Отсортированный список дат, у которых есть занятия.
  const sortedDates = useMemo(
    () => Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b)),
    [groupedByDate]
  );

  const renderSubtitle = (lesson: ScheduleLessonItem): string => {
    if (subtitleMode === 'teacher') {
      // Преподавателю показываем учеников.
      if (lesson.student_names.length === 0) return 'Без учеников';
      return lesson.student_names.join(', ');
    }
    // Студенту показываем преподавателя.
    return lesson.teacher_name;
  };

  return (
    <div className="schedule-list-view">
      <div className="slv-header">
        <h1 className="slv-title">Моё расписание</h1>
        <div className="slv-controls">
          <button className="slv-nav-btn" onClick={onPrevWeek} aria-label="Предыдущая неделя">
            ←
          </button>
          <button className="slv-today-btn" onClick={onToday}>
            Сегодня
          </button>
          <button className="slv-nav-btn" onClick={onNextWeek} aria-label="Следующая неделя">
            →
          </button>
          <span className="slv-range">
            {formatShort(fromDate)} — {formatShort(toDate)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="slv-state">
          <div className="slv-spinner" />
          <p>Загрузка расписания...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="slv-state">
          <p className="slv-empty">На выбранную неделю занятий нет.</p>
        </div>
      ) : (
        <div className="slv-days">
          {sortedDates.map((date) => (
            <div className="slv-day" key={date}>
              <div className={`slv-day-header${isToday(date) ? ' slv-day-today' : ''}`}>
                {formatDayHeader(date)}
                {isToday(date) && <span className="slv-today-badge">сегодня</span>}
              </div>
              <ul className="slv-lessons">
                {groupedByDate[date].map((lesson) => (
                  <li
                    className={`slv-lesson slv-status-${lesson.status}${
                      lesson.has_ended && lesson.status === 'scheduled'
                        ? ' slv-needs-review'
                        : ''
                    }`}
                    key={lesson.lesson_id}
                    onClick={() => setOpenLessonId(lesson.lesson_id)}
                  >
                    <div className="slv-time">
                      {trimSeconds(lesson.start_time)}
                      <span className="slv-time-sep">–</span>
                      {trimSeconds(lesson.end_time)}
                    </div>
                    <div className="slv-info">
                      <div className="slv-subtitle">{renderSubtitle(lesson)}</div>
                      {lesson.classroom_name && (
                        <div className="slv-classroom">{lesson.classroom_name}</div>
                      )}
                      {lesson.notes && <div className="slv-notes">{lesson.notes}</div>}
                    </div>
                    <div className="slv-status">
                      {lessonStatusLabel(lesson.status, lesson.has_ended)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {openLessonId !== null && (
        <LessonCard
          lessonId={openLessonId}
          onClose={() => setOpenLessonId(null)}
        />
      )}
    </div>
  );
};

export default ScheduleListView;