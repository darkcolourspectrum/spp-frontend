/**
 * Число занятий, ждущих отметки, по всем студиям.
 *
 * Своё локальное состояние, а не общий стор: виджету нужно только
 * число, а стор в этот момент может держать хвост конкретной студии
 * или преподавателя - перезаписывать его ради счётчика незачем.
 *
 * Считается живым запросом к расписанию: занятие переходит в ожидание
 * отметки само, по ходу часов, никакого события при этом нет, и в
 * проекции аналитики такого состояния не появится.
 */

import { useEffect, useState } from 'react';
import * as scheduleApi from '@/api/schedule';

const UnmarkedWidget = () => {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    scheduleApi
      .getUnmarkedLessons({ limit: 1 })
      .then((data) => {
        if (!cancelled) setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) setTotal(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (total === null) return null;

  return (
    <div className={`unmarked-widget${total > 0 ? ' has-items' : ''}`}>
      <div className="unmarked-widget__value">{total}</div>
      <div className="unmarked-widget__label">
        {total > 0 ? 'занятий ждут отметки' : 'занятий без отметки'}
      </div>
    </div>
  );
};

export default UnmarkedWidget;