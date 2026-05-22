/**
 * Экспорт всех компонентов CRM модуля.
 *
 * Наполняется по мере создания компонентов:
 *  - LeadKanbanBoard - главная доска с колонками статусов
 *  - LeadColumn - колонка одного статуса
 *  - LeadCard - карточка лида на доске
 *  - LeadDetailModal - модалка просмотра/редактирования карточки
 *  - и т.д.
 */


export { LeadCard } from './LeadCard/LeadCard';
export { LeadColumn } from './LeadColumn/LeadColumn';
export { LeadKanbanBoard } from './LeadKanbanBoard/LeadKanbanBoard';
export { LostReasonModal } from './LostReasonModal/LostReasonModal';
export { LeadDetailModal } from './LeadDetailModal/LeadDetailModal';
export { ConvertLeadModal } from './ConvertLeadModal/ConvertLeadModal';