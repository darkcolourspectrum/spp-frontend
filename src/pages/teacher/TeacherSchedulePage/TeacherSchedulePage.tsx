/**
 * TeacherSchedulePage - страница "Моё расписание" для преподавателя.
 *
 * Только просмотр. Грузит занятия преподавателя за выбранную неделю через
 * useSchedule (Redux thunk fetchTeacherSchedule -> GET /schedule/teachers/{id}).
 * Управление занятиями (создание/отмена/перенос) живёт внутри студии,
 * сюда сознательно не вынесено.
 *
 * Недельная навигация инкапсулирована в useWeekRange; загрузка данных
 * запускается эффектом по изменению пользователя или диапазона дат.
 */

import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import ScheduleListView from '../../../modules/schedule/components/ScheduleListView/ScheduleListView';
import { useWeekRange } from '../../../modules/schedule/hooks/useWeekRange';

const TeacherSchedulePage = () => {
  const { user } = useAuth();
  const { lessons, isLoadingSchedule, loadTeacherSchedule } = useSchedule();
  const { fromDate, toDate, goPrevWeek, goNextWeek, goToday } = useWeekRange();

  useEffect(() => {
    if (user?.id && fromDate && toDate) {
      loadTeacherSchedule(user.id, fromDate, toDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fromDate, toDate]);

  return (
    <ScheduleListView
      lessons={lessons}
      isLoading={isLoadingSchedule}
      fromDate={fromDate}
      toDate={toDate}
      subtitleMode="teacher"
      onPrevWeek={goPrevWeek}
      onNextWeek={goNextWeek}
      onToday={goToday}
    />
  );
};

export default TeacherSchedulePage;