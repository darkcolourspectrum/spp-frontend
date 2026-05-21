import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, LeadStatus } from '@/api/crm/types';
import { LEAD_STATUS_LABELS } from '@/modules/crm/hooks';
import { LeadCard } from '../LeadCard/LeadCard';
import './leadColumn.css';

interface LeadColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  /** Можно ли в эту колонку сбросить текущий перетаскиваемый лид. */
  isDropAllowed: boolean;
}

/**
 * Статусы, карточки которых нельзя двигать с доски.
 *
 * converted - лид уже стал клиентом, движение по воронке завершено.
 * lost - проигранный лид, путь окончен.
 *
 * При этом дропать в эти колонки МОЖНО (это и есть способ конвертировать
 * или проиграть лид через drag). Симметрично терминалу: прибывают, но
 * не уезжают.
 */
const TERMINAL_STATUSES: LeadStatus[] = ['converted', 'lost'];

export const LeadColumn = ({ status, leads, onLeadClick, isDropAllowed }: LeadColumnProps) => {
  // useDroppable делает колонку зоной приёма карточек.
  // id колонки = строковый статус, обработчик onDragEnd на доске
  // прочтёт его, чтобы понять, в какой статус переносится лид.
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  const isTerminal = TERMINAL_STATUSES.includes(status);

  return (
    <div
      className={`lead-column lead-column--${status} ${
        !isDropAllowed ? 'lead-column--blocked' : ''
      }`}
    >
      <div className="lead-column__header">
        <span className="lead-column__title">{LEAD_STATUS_LABELS[status]}</span>
        <span className="lead-column__count">{leads.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`lead-column__body ${isOver ? 'lead-column__body--over' : ''}`}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="lead-column__empty">Пусто</div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                // В терминальных колонках карточки задизейблены для drag.
                isDraggable={!isTerminal}
                onClick={onLeadClick}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};