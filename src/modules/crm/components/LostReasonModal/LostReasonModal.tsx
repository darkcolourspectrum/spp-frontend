import { useState } from 'react';
import type { Lead } from '@/api/crm/types';
import './lostReasonModal.css';

interface LostReasonModalProps {
  lead: Lead;
  onConfirm: (lostReason: string) => void;
  onCancel: () => void;
}

/**
 * Модалка запроса причины при переводе лида в статус 'lost'.
 *
 * Открывается в двух сценариях:
 *  - drop карточки в колонку 'lost' (из LeadKanbanBoard);
 *  - выбор статуса 'lost' в детальной модалке лида (LeadDetailModal,
 *    будет в следующем блоке).
 */
export const LostReasonModal = ({
  lead,
  onConfirm,
  onCancel,
}: LostReasonModalProps) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="lost-reason-modal__overlay" onClick={onCancel}>
      <div
        className="lost-reason-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lost-reason-modal__header">
          <h2>Лид потерян</h2>
          <button onClick={onCancel} className="lost-reason-modal__close">
            ×
          </button>
        </div>

        <div className="lost-reason-modal__body">
          <div className="lost-reason-modal__lead-info">
            <strong>{lead.name}</strong>
            <span>{lead.email}</span>
          </div>

          <div className="lost-reason-modal__field">
            <label>Причина потери *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Не отвечает, отказался, дорого и т.п."
              autoFocus
            />
          </div>
        </div>

        <div className="lost-reason-modal__footer">
          <button
            onClick={onCancel}
            className="lost-reason-modal__button lost-reason-modal__button--secondary"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="lost-reason-modal__button lost-reason-modal__button--primary"
          >
            Пометить как потерянный
          </button>
        </div>
      </div>
    </div>
  );
};