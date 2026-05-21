import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useCrm, LEAD_STATUS_LABELS } from '@/modules/crm/hooks';
import {
  updateLeadFields,
  addActivity,
  changeLeadStatus,
  convertLead,
} from '@/modules/crm/store';
import type {
  LeadStatus,
  LeadActivityType,
  Lead,
} from '@/api/crm/types';
import { LostReasonModal } from '../LostReasonModal/LostReasonModal';
import './leadDetailModal.css';

/** Все статусы воронки - для выпадающего списка смены статуса. */
const ALL_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'trial_scheduled',
  'trial_attended',
  'converted',
  'lost',
];

/** Метки типов активностей для отображения в журнале. */
const ACTIVITY_TYPE_LABELS: Record<LeadActivityType, string> = {
  note: 'Заметка',
  call: 'Звонок',
  status_changed: 'Смена статуса',
};

/** Форматирует дату для журнала: "19.05.2026 11:57". */
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const LeadDetailModal = () => {
  const dispatch = useAppDispatch();
  const {
    selectedLead,
    isLoadingLead,
    isSubmitting,
    handleCloseLeadDetail,
  } = useCrm();

  // Режимы редактирования секций.
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  // Временные значения полей при редактировании.
  const [emailDraft, setEmailDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

  // Форма добавления записи в журнал.
  const [activityType, setActivityType] = useState<'note' | 'call'>('note');
  const [activityContent, setActivityContent] = useState('');

  // Лид, для которого открыта модалка ввода причины проигрыша.
  const [pendingLostLead, setPendingLostLead] = useState<Lead | null>(null);

  // При смене selectedLead - сбрасываем все режимы редактирования
  // и наполняем драфты актуальными значениями.
  useEffect(() => {
    if (selectedLead) {
      setEmailDraft(selectedLead.email);
      setPhoneDraft(selectedLead.phone ?? '');
      setNotesDraft(selectedLead.notes ?? '');
      setEditingContacts(false);
      setEditingNotes(false);
      setActivityContent('');
      setActivityType('note');
    }
  }, [selectedLead?.id]);

  if (!selectedLead) return null;

  const lead = selectedLead;
  const isConverted = lead.converted_user_id !== null;

  // ===== Обработчики =====

  const handleSaveContacts = async () => {
    await dispatch(
      updateLeadFields({
        leadId: lead.id,
        data: {
          email: emailDraft.trim() || undefined,
          phone: phoneDraft.trim() || null,
        },
      }),
    );
    setEditingContacts(false);
  };

  const handleSaveNotes = async () => {
    await dispatch(
      updateLeadFields({
        leadId: lead.id,
        data: { notes: notesDraft.trim() || null },
      }),
    );
    setEditingNotes(false);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;

    if (newStatus === 'lost') {
      setPendingLostLead(lead);
      return;
    }

    dispatch(
      changeLeadStatus({
        leadId: lead.id,
        data: { status: newStatus },
        previousLead: lead,
      }),
    );
  };

  /**
   * Какие статусы доступны для смены у этого лида.
   *
   * Зеркало правила бэкенда (lead_service._validate_status_transition):
   *  - lost доступен всегда;
   *  - new/contacted - только для лидов без converted_user_id;
   *  - trial_scheduled/trial_attended/converted - только для лидов с converted_user_id;
   *  - trial_scheduled у неконвертированного запрещён вообще (только через конвертацию).
   *
   * Текущий статус лида всегда в списке, чтобы select показывал его сам.
   */
  const allowedStatuses = (currentStatus: LeadStatus, isConverted: boolean): LeadStatus[] => {
    return ALL_STATUSES.filter((s) => {
      if (s === currentStatus) return true;
      if (s === 'lost') return true;
      if (isConverted) {
        // Конвертированный лид: вперёд можно, назад в new/contacted/trial_scheduled нельзя.
        return ['trial_attended', 'converted'].includes(s);
      }
      // Неконвертированный: только pre-conversion статусы. trial_scheduled только через конвертацию.
      return ['new', 'contacted'].includes(s);
    });
  };

  const handleLostConfirm = (lostReason: string) => {
    if (!pendingLostLead) return;
    dispatch(
      changeLeadStatus({
        leadId: pendingLostLead.id,
        data: { status: 'lost', lost_reason: lostReason },
        previousLead: pendingLostLead,
      }),
    );
    setPendingLostLead(null);
  };

  const handleAddActivity = async () => {
    const trimmed = activityContent.trim();
    if (!trimmed) return;
    await dispatch(
      addActivity({
        leadId: lead.id,
        data: { type: activityType, content: trimmed },
      }),
    );
    setActivityContent('');
  };

  const handleConvert = () => {
    dispatch(convertLead(lead.id));
  };

  // ===== Рендер =====

  return (
    <>
      <div className="lead-detail-modal__overlay" onClick={handleCloseLeadDetail}>
        <div
          className="lead-detail-modal__content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="lead-detail-modal__header">
            <div>
              <h2>{lead.name}</h2>
              <span className={`lead-detail-modal__status-pill lead-detail-modal__status-pill--${lead.status}`}>
                {LEAD_STATUS_LABELS[lead.status]}
              </span>
            </div>
            <button
              onClick={handleCloseLeadDetail}
              className="lead-detail-modal__close"
            >
              ×
            </button>
          </div>

          <div className="lead-detail-modal__body">
            {/* Левая колонка - детали */}
            <div className="lead-detail-modal__details">
              {/* Контакты */}
              <section className="lead-detail-modal__section">
                <div className="lead-detail-modal__section-header">
                  <h3>Контакты</h3>
                  {!editingContacts && !isConverted && (
                    <button
                      onClick={() => setEditingContacts(true)}
                      className="lead-detail-modal__edit-btn"
                    >
                      Изменить
                    </button>
                  )}
                </div>
                {editingContacts ? (
                  <div className="lead-detail-modal__form">
                    <label>
                      Email *
                      <input
                        type="email"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                      />
                    </label>
                    <label>
                      Телефон
                      <input
                        type="tel"
                        value={phoneDraft}
                        onChange={(e) => setPhoneDraft(e.target.value)}
                        placeholder="Оставьте пустым, чтобы убрать"
                      />
                    </label>
                    <div className="lead-detail-modal__form-actions">
                      <button
                        onClick={() => setEditingContacts(false)}
                        className="lead-detail-modal__btn lead-detail-modal__btn--secondary"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveContacts}
                        disabled={isSubmitting || !emailDraft.trim()}
                        className="lead-detail-modal__btn lead-detail-modal__btn--primary"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="lead-detail-modal__field-list">
                    <div>
                      <span className="lead-detail-modal__field-label">Email:</span>
                      <span>{lead.email}</span>
                    </div>
                    <div>
                      <span className="lead-detail-modal__field-label">Телефон:</span>
                      <span>{lead.phone ?? '—'}</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Статус */}
              <section className="lead-detail-modal__section">
                <div className="lead-detail-modal__section-header">
                  <h3>Статус воронки</h3>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  disabled={isSubmitting}
                  className="lead-detail-modal__status-select"
                >
                  {allowedStatuses(lead.status, isConverted).map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                {lead.status === 'lost' && lead.lost_reason && (
                  <div className="lead-detail-modal__lost-reason">
                    <strong>Причина:</strong> {lead.lost_reason}
                  </div>
                )}
                {isConverted && (
                  <div className="lead-detail-modal__converted-info">
                    Лид конвертирован в клиента (ID пользователя:{' '}
                    <strong>{lead.converted_user_id}</strong>)
                  </div>
                )}
              </section>

              {/* Заметки */}
              <section className="lead-detail-modal__section">
                <div className="lead-detail-modal__section-header">
                  <h3>Описание</h3>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="lead-detail-modal__edit-btn"
                    >
                      Изменить
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="lead-detail-modal__form">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={4}
                      placeholder="Краткая сводка по лиду..."
                    />
                    <div className="lead-detail-modal__form-actions">
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="lead-detail-modal__btn lead-detail-modal__btn--secondary"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSubmitting}
                        className="lead-detail-modal__btn lead-detail-modal__btn--primary"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="lead-detail-modal__notes-view">
                    {lead.notes || <em>Нет описания</em>}
                  </div>
                )}
              </section>

              {/* Конвертация */}
              {!isConverted && (
                <section className="lead-detail-modal__section">
                  <button
                    onClick={handleConvert}
                    disabled={isSubmitting || lead.status === 'lost'}
                    className="lead-detail-modal__btn lead-detail-modal__btn--convert"
                  >
                    Конвертировать в клиента
                  </button>
                  <p className="lead-detail-modal__convert-hint">
                    Создаст аккаунт пользователя и переведёт лида в статус
                    «Записаны на пробное».
                  </p>
                </section>
              )}
            </div>

            {/* Правая колонка - журнал активностей */}
            <div className="lead-detail-modal__journal">
              <h3>Журнал</h3>

              <div className="lead-detail-modal__activity-form">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as 'note' | 'call')}
                >
                  <option value="note">Заметка</option>
                  <option value="call">Звонок</option>
                </select>
                <textarea
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                  rows={2}
                  placeholder="Что записать?"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={isSubmitting || !activityContent.trim()}
                  className="lead-detail-modal__btn lead-detail-modal__btn--primary"
                >
                  Добавить
                </button>
              </div>

              <div className="lead-detail-modal__activity-list">
                {isLoadingLead && <div>Загрузка...</div>}
                {lead.activities.length === 0 && !isLoadingLead && (
                  <div className="lead-detail-modal__empty">Журнал пуст</div>
                )}
                {[...lead.activities].reverse().map((activity) => (
                  <div
                    key={activity.id}
                    className={`lead-detail-modal__activity lead-detail-modal__activity--${activity.type}`}
                  >
                    <div className="lead-detail-modal__activity-meta">
                      <span className="lead-detail-modal__activity-type">
                        {ACTIVITY_TYPE_LABELS[activity.type]}
                      </span>
                      <span className="lead-detail-modal__activity-date">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>
                    <div className="lead-detail-modal__activity-content">
                      {activity.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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