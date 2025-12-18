/**
 * ScheduleCalendar - календарь с занятиями
 */

import { useMemo } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { LESSON_STATUS_LABELS } from '@/api/schedule/types';
import type { ScheduleLessonItem } from '@/api/schedule/types';
import './scheduleCalendar.css';

interface ScheduleCalendarProps {
  lessons: ScheduleLessonItem[];
  studioId: number;
  isLoading: boolean;
  isReadOnly?: boolean;
}

const ScheduleCalendar = ({ lessons, studioId, isLoading, isReadOnly = false }: ScheduleCalendarProps) => {
  const { updateDateRange, filters } = useSchedule();
  
  // Группируем занятия по датам
  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, ScheduleLessonItem[]> = {};
    
    lessons.forEach((lesson) => {
      if (!grouped[lesson.lesson_date]) {
        grouped[lesson.lesson_date] = [];
      }
      grouped[lesson.lesson_date].push(lesson);
    });
    
    // Сортируем занятия внутри каждой даты
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    
    return grouped;
  }, [lessons]);
  
  // Получаем отсортированные даты
  const sortedDates = useMemo(() => {
    return Object.keys(lessonsByDate).sort();
  }, [lessonsByDate]);
  
  const handlePreviousWeek = () => {
    const fromDate = new Date(filters.fromDate);
    fromDate.setDate(fromDate.getDate() - 7);
    
    const toDate = new Date(filters.toDate);
    toDate.setDate(toDate.getDate() - 7);
    
    updateDateRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
  };
  
  const handleNextWeek = () => {
    const fromDate = new Date(filters.fromDate);
    fromDate.setDate(fromDate.getDate() + 7);
    
    const toDate = new Date(filters.toDate);
    toDate.setDate(toDate.getDate() + 7);
    
    updateDateRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
  };
  
  const handleToday = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    updateDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return {
      day: date.getDate(),
      weekDay: weekDays[date.getDay()],
      month: date.toLocaleDateString('ru-RU', { month: 'short' }),
    };
  };
  
  if (isLoading) {
    return (
      <div className="schedule-calendar-loading">
        <div className="spinner"></div>
        <p>Загрузка расписания...</p>
      </div>
    );
  }
  
  return (
    <div className="schedule-calendar">
      {/* Navigation */}
      <div className="calendar-navigation">
        <button onClick={handlePreviousWeek} className="nav-button">
          ← Предыдущая неделя
        </button>
        <button onClick={handleToday} className="nav-button today">
          Сегодня
        </button>
        <button onClick={handleNextWeek} className="nav-button">
          Следующая неделя →
        </button>
      </div>
      
      {/* Date Range Info */}
      <div className="date-range-info">
        {new Date(filters.fromDate).toLocaleDateString('ru-RU')} - {new Date(filters.toDate).toLocaleDateString('ru-RU')}
      </div>
      
      {/* Calendar Content */}
      {sortedDates.length === 0 ? (
        <div className="no-lessons">
          <div className="no-lessons-icon">📅</div>
          <h3>Нет занятий на выбранный период</h3>
          <p>Создайте шаблоны для автоматической генерации занятий</p>
        </div>
      ) : (
        <div className="calendar-days">
          {sortedDates.map((dateString) => {
            const dateInfo = formatDate(dateString);
            const dayLessons = lessonsByDate[dateString];
            
            return (
              <div key={dateString} className="calendar-day">
                <div className="day-header">
                  <div className="day-number">{dateInfo.day}</div>
                  <div className="day-info">
                    <span className="day-weekday">{dateInfo.weekDay}</span>
                    <span className="day-month">{dateInfo.month}</span>
                  </div>
                  <div className="day-count">{dayLessons.length} занятий</div>
                </div>
                
                <div className="day-lessons">
                  {dayLessons.map((lesson) => (
                    <div 
                      key={lesson.lesson_id} 
                      className={`lesson-card status-${lesson.status}`}
                    >
                      <div className="lesson-time">
                        {lesson.start_time} - {lesson.end_time}
                      </div>
                      <div className="lesson-teacher">
                        👤 {lesson.teacher_name}
                      </div>
                      {lesson.classroom_name && (
                        <div className="lesson-classroom">
                          🚪 {lesson.classroom_name}
                        </div>
                      )}
                      <div className="lesson-students">
                        👥 {lesson.student_ids.length} {lesson.student_ids.length === 1 ? 'ученик' : 'учеников'}
                      </div>
                      <div className="lesson-status">
                        <span className={`status-badge ${lesson.status}`}>
                          {LESSON_STATUS_LABELS[lesson.status]}
                        </span>
                        {lesson.is_recurring && (
                          <span className="recurring-badge" title="Создано из шаблона">
                            🔄
                          </span>
                        )}
                      </div>
                      {lesson.notes && (
                        <div className="lesson-notes">
                          📝 {lesson.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;