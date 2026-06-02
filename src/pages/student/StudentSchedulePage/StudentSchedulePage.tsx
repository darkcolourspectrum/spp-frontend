/**
 * StudentSchedulePage - страница "Моё расписание" для студента.
 *
 * Только просмотр. Грузит занятия студента за выбранную неделю через
 * useSchedule (Redux thunk fetchStudentSchedule -> GET /schedule/students/{id}).
 *
 * Зеркальна TeacherSchedulePage; отличие - роль (student), вызываемый
 * thunk и subtitleMode (студенту в строке показываем преподавателя).
 */

import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import ScheduleListView from '../../../modules/schedule/components/ScheduleListView/ScheduleListView';
import { useWeekRange } from '../../../modules/schedule/hooks/useWeekRange';

const StudentSchedulePage = () => {
  const { user } = useAuth();
  const { lessons, isLoadingSchedule, loadStudentSchedule } = useSchedule();
  const { fromDate, toDate, goPrevWeek, goNextWeek, goToday } = useWeekRange();

  useEffect(() => {
    if (user?.id && fromDate && toDate) {
      loadStudentSchedule(user.id, fromDate, toDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fromDate, toDate]);

  return (
    <ScheduleListView
      lessons={lessons}
      isLoading={isLoadingSchedule}
      fromDate={fromDate}
      toDate={toDate}
      subtitleMode="student"
      onPrevWeek={goPrevWeek}
      onNextWeek={goNextWeek}
      onToday={goToday}
    />
  );
};

export default StudentSchedulePage;