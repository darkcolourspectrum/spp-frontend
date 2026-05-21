import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '@/api/crm/types';
import './leadCard.css';

interface LeadCardProps {
  lead: Lead;
  /**
   * Можно ли перетаскивать карточку. Карточки в терминальных статусах
   * (converted, lost) задизейблены - их движение по воронке закончено.
   */
  isDraggable: boolean;
  /** Открыть детальную модалку лида. */
  onClick: (lead: Lead) => void;
}

/** Форматирует "2 часа назад", "3 дня назад" и т.п. */
const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  return date.toLocaleDateString('ru-RU');
};

export const LeadCard = ({ lead, isDraggable, onClick }: LeadCardProps) => {
  // useSortable даёт обвязку для draggable+droppable элемента.
  // disabled полностью отключает участие карточки в drag-and-drop.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: 'lead', lead },
    disabled: !isDraggable,
  });

  // Трансформация во время перетаскивания (плавное движение карточки).
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Карточка под курсором при drag - полупрозрачная.
    opacity: isDragging ? 0.4 : 1,
  };

  const handleClick = () => {
    // Во время перетаскивания клик не должен срабатывать.
    if (isDragging) return;
    onClick(lead);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`lead-card ${isDraggable ? '' : 'lead-card--locked'}`}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="lead-card__name">{lead.name}</div>
      <div className="lead-card__email">{lead.email}</div>
      {lead.phone && (
        <div className="lead-card__phone">{lead.phone}</div>
      )}
      <div className="lead-card__footer">
        <span className="lead-card__time">
          {formatRelativeTime(lead.created_at)}
        </span>
        {lead.source !== 'landing' && (
          <span className="lead-card__source">{lead.source}</span>
        )}
      </div>
    </div>
  );
};