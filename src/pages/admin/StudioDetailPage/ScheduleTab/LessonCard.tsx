/**
 * LessonCard - карточка одного занятия.
 *
 * Принимает только lessonId и грузит данные сама через GET /lessons/{id}.
 * Благодаря этому карточка работает из любого места: сетки студии,
 * списка преподавателя, списка ученика, ссылки из уведомления. Если бы
 * она принимала элемент списка расписания, то была бы привязана к тому
 * экрану, откуда открыта, а поверхностей уже три.
 *
 * Второй довод в пользу отдельного запроса: посещаемость нужна точечно,
 * при открытии одной карточки. Тащить её в список, который грузится на
 * неделю целиком, значит платить за данные, которые в большинстве
 * случаев никто не откроет.
 *
 * Пока только просмотр. Действия добавляются следующим шагом.
 */

import { useEffect, useState } from 'react';
import * as scheduleApi from '@/api/schedule';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import {
  completeLesson,
  markLessonAsMissed,
  markLessonAsTeacherMissed,
  restoreLesson,
} from '@/modules/schedule/store/scheduleSlice/actionCreators';
import {
  LESSON_STATUS_LABELS,
  ATTENDANCE_STATUS_LABELS,
} from '@/api/schedule/types';
import type {
  AttendanceStatus,
  LessonStatus,
  LessonWithDetails,
} from '@/api/schedule/types';
import './lessonCard.css';

interface LessonCardProps {
  lessonId: number;
  onClose: () => void;
}

const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

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

/** "HH:MM:SS" -> "HH:MM". Бекенд отдаёт время с секундами. */
const trimSeconds = (value: string): string =>
  value && value.length >= 5 ? value.slice(0, 5) : value;

/** "YYYY-MM-DD" -> "Понедельник, 2 июня". */
const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

/**
 * Подпись посещаемости с оглядкой на статус занятия.
 *
 * В базе у ученика стоит 'cancelled' и когда занятие отменили заранее,
 * и когда его сорвал преподаватель: для ученика это одно событие -
 * занятия не было, вины на нём нет, в счёт не идёт. Причина уже
 * записана в статусе занятия, дублировать её пятым значением
 * посещаемости значит завести две копии одного факта.
 *
 * А вот подпись должна отличаться, и она выводится из пары значений,
 * ничего не храня.
 */
const attendanceLabel = (
  attendanceStatus: string,
  lessonStatus: LessonStatus
): string => {
  if (attendanceStatus === 'cancelled' && lessonStatus === 'teacher_missed') {
    return 'Не состоялось';
  }
  return ATTENDANCE_STATUS_LABELS[attendanceStatus] || attendanceStatus;
};

const LessonCard = ({ lessonId, onClose }: LessonCardProps) => {
  const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const { user, isAdmin } = useAuth();
const dispatch = useAppDispatch();

const [isActing, setIsActing] = useState(false);
const [actionError, setActionError] = useState<string | null>(null);
// Счётчик перезагрузок: после действия карточка перечитывает себя,
// не переоткрываясь. Проще, чем выносить загрузку в отдельный колбэк.
const [reloadToken, setReloadToken] = useState(0);

// Режим поимённой отметки. Нужен только групповым занятиям и только
// когда пришли не все - в остальных случаях посещаемость выводится
// из статуса занятия автоматически.
const [showAttendance, setShowAttendance] = useState(false);
  /** Посещаемость поимённо: id ученика -> был или не был. */
  type AttendanceMap = Record<number, AttendanceStatus>;
  const [attendance, setAttendance] = useState<AttendanceMap>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await scheduleApi.getLessonById(lessonId);
        // Пока запрос шёл, карточку могли закрыть и открыть другую.
        if (!cancelled) setLesson(data);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.response?.data?.detail || 'Не удалось загрузить занятие'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [lessonId, reloadToken]);

  // Закрытие по Escape: карточка открывается кликом по сетке, и мышь
  // в этот момент далеко от крестика.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

    const canManage = !!lesson && (isAdmin() || lesson.teacher_id === user?.id);

  const runAction = async (action: () => Promise<unknown>) => {
    setIsActing(true);
    setActionError(null);
    try {
      await action();
      setShowAttendance(false);
      setReloadToken((token) => token + 1);
    } catch (e: any) {
      setActionError(e?.response?.data?.detail || 'Действие не удалось');
    } finally {
      setIsActing(false);
    }
  };

  const openAttendance = () => {
    if (!lesson) return;
    // По умолчанию все присутствовали - преподаватель снимает тех, кого
    // не было, а не отмечает каждого пришедшего.
    const initial: Record<number, AttendanceStatus> = {};
    lesson.students.forEach((item) => {
      // На неотмеченном занятии по умолчанию все были - преподаватель
      // снимает отсутствовавших. На уже отмеченном показываем то, что
      // стоит сейчас, иначе повторное открытие списка молча вернуло бы
      // всем присутствие.
      initial[item.student_id] =
        item.attendance_status === 'missed' ? 'missed' : 'attended';
    });
    setAttendance(initial);
    setShowAttendance(true);
  };

  const toggleStudent = (studentId: number) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'attended' ? 'missed' : 'attended',
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content lesson-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Занятие</h2>
          <button onClick={onClose} className="close-button" type="button">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {isLoading && <div className="lesson-card-loading">Загрузка...</div>}

          {error && <div className="error-message">{error}</div>}

          {lesson && !isLoading && (
            <>
              <div className="lesson-card-headline">
                <div className="lesson-card-date">
                  {formatDate(lesson.lesson_date)}
                </div>
                <div className="lesson-card-time">
                  {trimSeconds(lesson.start_time)} -{' '}
                  {trimSeconds(lesson.end_time)}
                </div>
              </div>

              <div className="lesson-card-badges">
                <span className={`lesson-card-status status-${lesson.status}`}>
                  {LESSON_STATUS_LABELS[lesson.status] || lesson.status}
                </span>
                {lesson.is_recurring && (
                  <span className="lesson-card-badge">Из шаблона</span>
                )}
                {lesson.has_ended && lesson.status === 'scheduled' && (
                  <span className="lesson-card-badge warning">Не отмечено</span>
                )}
              </div>

              <dl className="lesson-card-facts">
                <dt>Преподаватель</dt>
                <dd>{lesson.teacher_name || `ID ${lesson.teacher_id}`}</dd>

                <dt>Кабинет</dt>
                <dd>{lesson.classroom_name || 'Онлайн'}</dd>
              </dl>

              {lesson.cancellation_reason && (
                <div className="lesson-card-reason">
                  <strong>Причина отмены:</strong> {lesson.cancellation_reason}
                </div>
              )}

              {lesson.notes && (
                <div className="lesson-card-notes">{lesson.notes}</div>
              )}

              <div className="lesson-card-students">
                <div className="lesson-card-section-title">
                  Ученики ({lesson.students.length})
                </div>

                {lesson.students.length === 0 ? (
                  <div className="lesson-card-empty">
                    На занятие никто не записан
                  </div>
                ) : (
                  <ul className="lesson-card-student-list">
                    {lesson.students.map((student) => (
                      <li
                        key={student.student_id}
                        className="lesson-card-student"
                      >
                        <span className="student-name">
                          {student.student_name || `ID ${student.student_id}`}
                        </span>
                        <span
                          className={`attendance-chip attendance-${student.attendance_status}`}
                        >
                          {attendanceLabel(
                            student.attendance_status,
                            lesson.status
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
                            {canManage && (
                <div className="lesson-card-actions">
                  {actionError && (
                    <div className="error-message">{actionError}</div>
                  )}

                  {!lesson.has_ended && lesson.status === 'scheduled' && (
                    <div className="lesson-card-hint">
                      Занятие ещё не закончилось. Отметить результат можно
                      после времени окончания.
                    </div>
                  )}

                  {lesson.status === 'cancelled' && (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={isActing}
                      onClick={() =>
                        runAction(() => dispatch(restoreLesson(lesson.id)))
                      }
                    >
                      Вернуть в расписание
                    </button>
                  )}

                  {lesson.has_ended &&
                    lesson.status !== 'cancelled' &&
                    !showAttendance && (
                      <div className="lesson-card-action-row">
                        {lesson.status !== 'completed' && (
                          <button
                            type="button"
                            className="btn-primary"
                            disabled={isActing}
                            onClick={() =>
                              runAction(() =>
                                dispatch(completeLesson(lesson.id))
                              )
                            }
                          >
                            Занятие прошло
                          </button>
                        )}

                        {lesson.students.length > 1 && (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isActing}
                            onClick={openAttendance}
                          >
                            Были не все
                          </button>
                        )}

                        {lesson.status !== 'missed' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isActing}
                            onClick={() =>
                              runAction(() =>
                                dispatch(markLessonAsMissed(lesson.id))
                              )
                            }
                          >
                            {lesson.students.length > 1
                              ? 'Никто не пришёл'
                              : 'Ученик не пришёл'}
                          </button>
                        )}

                        {lesson.status !== 'teacher_missed' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isActing}
                            onClick={() =>
                              runAction(() =>
                                dispatch(markLessonAsTeacherMissed(lesson.id))
                              )
                            }
                          >
                            Сорвано преподавателем
                          </button>
                        )}
                      </div>
                    )}

                  {showAttendance && (
                    <div className="lesson-card-attendance">
                      <div className="lesson-card-section-title">
                        Кто был на занятии
                      </div>
                      {lesson.students.map((item) => (
                        <label
                          key={item.student_id}
                          className="attendance-row"
                        >
                          <input
                            type="checkbox"
                            checked={attendance[item.student_id] === 'attended'}
                            onChange={() => toggleStudent(item.student_id)}
                          />
                          <span>
                            {item.student_name || `ID ${item.student_id}`}
                          </span>
                        </label>
                      ))}

                      <div className="lesson-card-action-row">
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isActing}
                          onClick={() => setShowAttendance(false)}
                        >
                          Назад
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={isActing}
                          onClick={() =>
                            runAction(() =>
                              dispatch(completeLesson(lesson.id, attendance))
                            )
                          }
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;