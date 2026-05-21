import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { useAppDispatch } from '@/store/hooks';
import { useCrm, LEAD_STATUS_COLUMNS } from '@/modules/crm/hooks';
import {
  changeLeadStatus,
  fetchLeadDetail,
  setError,
  updateLeadInList,
} from '@/modules/crm/store';
import { LeadCard } from '../LeadCard/LeadCard';
import type { Lead, LeadStatus } from '@/api/crm/types';
import { LeadColumn } from '../LeadColumn/LeadColumn';
import { LostReasonModal } from '../LostReasonModal/LostReasonModal';
import './leadKanbanBoard.css';


export const LeadKanbanBoard = () => {
  const dispatch = useAppDispatch();
  const { leadsByStatus, isLoadingLeads } = useCrm();

  // Когда лид перетащили в lost, нужна причина - открываем модалку
  // и держим лид во временном состоянии до подтверждения.
  const [pendingLostLead, setPendingLostLead] = useState<Lead | null>(null);

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  /**
   * Какие колонки доступны для drop текущего перетаскиваемого лида.
   *
   * Зеркало правила бэка - то же, что и в LeadDetailModal,
   * но возвращает Set для быстрой проверки has().
   */
  const dropAllowedStatuses = (lead: Lead | null): Set<LeadStatus> => {
    if (!lead) return new Set();
    const isConverted = lead.converted_user_id !== null;
    const allowed: LeadStatus[] = ['lost'];
    if (isConverted) {
      allowed.push('trial_attended', 'converted');
    } else {
      allowed.push('new', 'contacted');
    }
    // Текущий статус лида - вернуть на место можно всегда.
    allowed.push(lead.status);
    return new Set(allowed);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as Lead | undefined;
    setActiveLead(lead ?? null);
  };

  const handleDragCancel = () => {
    setActiveLead(null);
  };

  // Сенсор с activation constraint: drag начинается только после
  // смещения курсора на 8 пикселей. Это позволяет обычному клику по
  // карточке (для открытия модалки) работать без конфликтов с dnd.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleLeadClick = (lead: Lead) => {
    // Загружаем карточку с журналом и кладём в selectedLead -
    // это откроет LeadDetailModal (она слушает selectedLead из store).
    dispatch(fetchLeadDetail(lead.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const lead = active.data.current?.lead as Lead | undefined;
    const targetStatus = over.data.current?.status as LeadStatus | undefined;

    if (!lead || !targetStatus) return;
    if (lead.status === targetStatus) return;

    // Проверка допустимости drop - не дёргаем бэк зря.
    if (!dropAllowedStatuses(lead).has(targetStatus)) {
      const reason =
        targetStatus === 'trial_scheduled' && lead.converted_user_id === null
          ? 'Используйте «Конвертировать в клиента» в карточке лида.'
          : 'Этот переход недопустим для данного лида.';
      dispatch(setError(reason));
      return;
    }

    // Drop в lost - нужна причина, открываем модалку.
    if (targetStatus === 'lost') {
      setPendingLostLead(lead);
      return;
    }

    // Оптимистичный апдейт: сразу переставляем карточку в новую колонку.
    // Если запрос упадёт, thunk вернёт previousLead и откатит.
    const optimisticLead: Lead = { ...lead, status: targetStatus };
    dispatch(updateLeadInList(optimisticLead));

    dispatch(
      changeLeadStatus({
        leadId: lead.id,
        data: { status: targetStatus },
        previousLead: lead,
      }),
    );
  };

  // Подтверждение причины проигрыша из модалки.
  const handleLostConfirm = (lostReason: string) => {
    if (!pendingLostLead) return;

    const optimisticLead: Lead = {
      ...pendingLostLead,
      status: 'lost',
      lost_reason: lostReason,
    };
    dispatch(updateLeadInList(optimisticLead));

    dispatch(
      changeLeadStatus({
        leadId: pendingLostLead.id,
        data: { status: 'lost', lost_reason: lostReason },
        previousLead: pendingLostLead,
      }),
    );

    setPendingLostLead(null);
  };

  if (isLoadingLeads && Object.values(leadsByStatus).every((c) => c.length === 0)) {
    return <div className="lead-board__loading">Загрузка лидов...</div>;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="lead-board">
          {LEAD_STATUS_COLUMNS.map((status) => (
            <LeadColumn
              key={status}
              status={status}
              leads={leadsByStatus[status]}
              onLeadClick={handleLeadClick}
              isDropAllowed={
                activeLead === null || dropAllowedStatuses(activeLead).has(status)
              }
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <LeadCard
              lead={activeLead}
              isDraggable={false}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingLostLead && (
        <LostReasonModal
          lead={pendingLostLead}
          onConfirm={handleLostConfirm}
          onCancel={() => setPendingLostLead(null)}
        />
      )}
    </>
  );
};