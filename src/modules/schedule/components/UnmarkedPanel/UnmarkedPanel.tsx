/**
 * UnmarkedPanel - хвост занятий, ждущих отметки.
 *
 * Отдельно от списка расписания намеренно. Расписание отвечает на
 * вопрос "что у меня когда" и показывает выбранную неделю. Хвост
 * отвечает на "что от меня требуется" и сквозной: в нём может лежать
 * занятие месячной давности, до которого не дошли руки. Фильтром
 * внутри недельного списка такое не покажешь - а именно оно и есть
 * проблема.
 *
 * Пустой хвост не рисуется вовсе: панель ведёт себя как уведомление,
 * а не как постоянный раздел.
 */

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUnmarkedLessons } from '@/modules/schedule/store';
import LessonCard from '@/modules/schedule/components/LessonCard/LessonCard';
import type { UnmarkedLessonsParams } from '@/api/schedule/types';
import './unmarkedPanel.css';

interface UnmarkedPanelProps {
  /** Ограничение выборки. Преподавателю сервер и так отдаёт только его. */
  params?: UnmarkedLessonsParams;
}

const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const trimSeconds = (value: string): string =>
  value && value.length >= 5 ? value.slice(0, 5) : value;

/** "YYYY-MM-DD" -> "12 мая, пн". */
const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${
    WEEKDAYS[date.getDay()]
  }`;
};

/** "3 занятия ждут отметки" - с правильным окончанием. */
const headline = (count: number): string => {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} занятий ждут отметки`;
  if (last === 1) return `${count} занятие ждёт отметки`;
  if (last >= 2 && last <= 4) return `${count} занятия ждут отметки`;
  return `${count} занятий ждут отметки`;
};

const UnmarkedPanel = ({ params = {} }: UnmarkedPanelProps) => {
  const dispatch = useAppDispatch();
  const { unmarked, unmarkedTotal } = useAppSelector((state) => state.schedule);

  const [isOpen, setIsOpen] = useState(false);
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  // Зависимость по строке, а не по объекту: params приходит литералом
  // и каждый рендер родителя создаёт новую ссылку - эффект уходил бы
  // в бесконечный цикл.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    dispatch(fetchUnmarkedLessons(params));
  }, [dispatch, paramsKey]);

  if (unmarkedTotal === 0) return null;

  return (
    <div className="unmarked-panel">
      <button
        type="button"
        className="unmarked-panel__toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className="unmarked-panel__dot" />
        <span className="unmarked-panel__title">
          {headline(unmarkedTotal)}
        </span>
        <span className={`unmarked-panel__caret ${isOpen ? 'open' : ''}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <ul className="unmarked-panel__list">
          {unmarked.map((lesson) => (
            <li
              key={lesson.lesson_id}
              className="unmarked-panel__item"
              onClick={() => setOpenLessonId(lesson.lesson_id)}
            >
              <span className="unmarked-panel__date">
                {formatDate(lesson.lesson_date)}
              </span>
              <span className="unmarked-panel__time">
                {trimSeconds(lesson.start_time)}-
                {trimSeconds(lesson.end_time)}
              </span>
              <span className="unmarked-panel__who">
                {lesson.student_names.length > 0
                  ? lesson.student_names.join(', ')
                  : 'Без учеников'}
              </span>
            </li>
          ))}

          {unmarkedTotal > unmarked.length && (
            <li className="unmarked-panel__more">
              и ещё {unmarkedTotal - unmarked.length}
            </li>
          )}
        </ul>
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

export default UnmarkedPanel;