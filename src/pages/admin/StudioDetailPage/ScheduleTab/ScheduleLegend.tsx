/**
 * ScheduleLegend - расшифровка того, что человек видит в сетке.
 *
 * Не документация: только цвета, пометки и два жеста, которые
 * встречаются прямо на этом экране. Правила доступности действий,
 * отработки и роли сюда не входят - им место в пособии.
 *
 * Свёрнута по умолчанию. Развёрнутая панель под шапкой съедала бы
 * высоту у сетки, а смотрят в неё редко и один раз.
 */

import { useState } from 'react';

interface LegendItem {
  className: string;
  label: string;
  hint: string;
}

const STATUS_ITEMS: LegendItem[] = [
  {
    className: 'status-scheduled',
    label: 'Запланировано',
    hint: 'Занятие впереди, его можно перенести или отменить',
  },
  {
    className: 'status-completed',
    label: 'Прошло',
    hint: 'Занятие состоялось, посещаемость отмечена',
  },
  {
    className: 'status-missed',
    label: 'Ученик не пришёл',
    hint: 'Занятие не состоялось, время кабинета было занято',
  },
  {
    className: 'status-teacher_missed',
    label: 'Сорвано преподавателем',
    hint: 'Занятия не было, вины учеников в этом нет',
  },
];

const MARK_ITEMS: LegendItem[] = [
  {
    className: 'needs-review',
    label: 'Не отмечено',
    hint: 'Время занятия истекло, а результат никто не проставил',
  },
  {
    className: 'is-marker',
    label: 'Отменено',
    hint: 'Занятие убрано из расписания, время свободно для нового',
  },
];

const ScheduleLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="schedule-legend">
      <button
        type="button"
        className="legend-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        title="Обозначения"
      >
        ?
      </button>

      {isOpen && (
        <div className="legend-panel">
          <div className="legend-group">
            <div className="legend-group-title">Статус занятия</div>
            {STATUS_ITEMS.map((item) => (
              <div key={item.className} className="legend-row">
                <span className={`legend-swatch ${item.className}`} />
                <span className="legend-label">{item.label}</span>
                <span className="legend-hint">{item.hint}</span>
              </div>
            ))}
          </div>

          <div className="legend-group">
            <div className="legend-group-title">Пометки</div>
            {MARK_ITEMS.map((item) => (
              <div key={item.className} className="legend-row">
                <span className={`legend-swatch ${item.className}`} />
                <span className="legend-label">{item.label}</span>
                <span className="legend-hint">{item.hint}</span>
              </div>
            ))}
          </div>

          <div className="legend-group">
            <div className="legend-group-title">Управление</div>
            <div className="legend-row plain">
              Клик по пустому месту создаёт занятие на этом времени
            </div>
            <div className="legend-row plain">
              Клик по занятию открывает карточку с учениками и действиями
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleLegend;