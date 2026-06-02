/**
 * useWeekRange - навигация по неделям поверх filters/updateDateRange из
 * useSchedule.
 *
 * Инкапсулирует расчёт диапазона "понедельник–воскресенье" и его сдвиг,
 * чтобы страницы расписания (студент/преподаватель) не дублировали эту
 * арифметику дат. Сам не грузит данные - только двигает диапазон в
 * Redux-фильтрах; загрузку запускает эффект на странице по изменению
 * filters.fromDate/toDate.
 */

import { useCallback, useEffect } from 'react';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';

/** Понедельник недели, в которую попадает дата. */
const weekStart = (d: Date): Date => {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Вс .. 6=Сб
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (iso: string, days: number): string => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toIso(d);
};

const currentWeekRange = (): { from: string; to: string } => {
  const monday = weekStart(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toIso(monday), to: toIso(sunday) };
};

export const useWeekRange = () => {
  const { filters, updateDateRange } = useSchedule();

  // На монтировании выставляем текущую неделю.
  useEffect(() => {
    const { from, to } = currentWeekRange();
    updateDateRange(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrevWeek = useCallback(() => {
    updateDateRange(addDays(filters.fromDate, -7), addDays(filters.toDate, -7));
  }, [filters.fromDate, filters.toDate, updateDateRange]);

  const goNextWeek = useCallback(() => {
    updateDateRange(addDays(filters.fromDate, 7), addDays(filters.toDate, 7));
  }, [filters.fromDate, filters.toDate, updateDateRange]);

  const goToday = useCallback(() => {
    const { from, to } = currentWeekRange();
    updateDateRange(from, to);
  }, [updateDateRange]);

  return {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    goPrevWeek,
    goNextWeek,
    goToday,
  };
};

export default useWeekRange;