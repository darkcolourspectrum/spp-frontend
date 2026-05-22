import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useCrm } from '@/modules/crm/hooks';
import { convertLead } from '@/modules/crm/store';
import { getStudios } from '@/api/crm';
import type { Lead, StudioOption } from '@/api/crm/types';
import './convertLeadModal.css';

interface ConvertLeadModalProps {
  lead: Lead;
  onClose: () => void;
}

/** Разбить полное имя на first/last по первому пробелу. */
const splitName = (fullName: string): [string, string] => {
  const trimmed = fullName.trim();
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return [trimmed, trimmed];
  return [trimmed.slice(0, idx), trimmed.slice(idx + 1).trim()];
};

export const ConvertLeadModal = ({ lead, onClose }: ConvertLeadModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting, error } = useCrm();

  // Список студий и состояние его загрузки.
  const [studios, setStudios] = useState<StudioOption[]>([]);
  const [isLoadingStudios, setIsLoadingStudios] = useState(true);
  const [studiosError, setStudiosError] = useState<string | null>(null);

  // Поля формы. Предзаполнены из лида при первом рендере.
  const [firstNameInit, lastNameInit] = splitName(lead.name);
  const [firstName, setFirstName] = useState(firstNameInit);
  const [lastName, setLastName] = useState(lastNameInit);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone ?? '');
  const [studioId, setStudioId] = useState<number | ''>(lead.studio_id ?? '');

  // Флаг "я только что нажал Конвертировать" - чтобы понять,
  // когда isSubmitting сменился с true на false именно по нашей операции
  // (а не по какой-то параллельной).
  const [submitted, setSubmitted] = useState(false);

  // Загрузка списка студий при открытии модалки.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoadingStudios(true);
        setStudiosError(null);
        const list = await getStudios();
        if (!cancelled) setStudios(list);
      } catch (err: any) {
        if (!cancelled) {
          setStudiosError(
            err?.response?.data?.detail ?? 'Не удалось загрузить список студий',
          );
        }
      } finally {
        if (!cancelled) setIsLoadingStudios(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Автозакрытие модалки после успешной конвертации.
  // Условие: мы нажали Конвертировать (submitted=true), серверный запрос
  // завершился (isSubmitting сменился true->false), и ошибки нет.
  useEffect(() => {
    if (submitted && !isSubmitting && !error) {
      onClose();
    }
  }, [submitted, isSubmitting, error, onClose]);

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    studioId !== '';

  const handleSubmit = () => {
    if (!isFormValid || isSubmitting) return;
    setSubmitted(true);
    dispatch(
      convertLead({
        leadId: lead.id,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          // Пустая строка телефона - значит "не передавать";
          // бэк возьмёт телефон из лида (или оставит null, если в лиде тоже нет).
          phone: phone.trim() || undefined,
          studio_id: studioId as number,
        },
      }),
    );
  };

  return (
    <div className="convert-lead-modal__overlay" onClick={onClose}>
      <div
        className="convert-lead-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="convert-lead-modal__header">
          <h2>Конвертация лида в клиента</h2>
          <button onClick={onClose} className="convert-lead-modal__close">
            ×
          </button>
        </div>

        <div className="convert-lead-modal__body">
          <p className="convert-lead-modal__hint">
            Будет создан аккаунт клиента и привязан к выбранной студии.
            Лид перейдёт в статус «Записаны на пробное».
          </p>

          <div className="convert-lead-modal__row">
            <label className="convert-lead-modal__field">
              Имя *
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className="convert-lead-modal__field">
              Фамилия *
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={100}
              />
            </label>
          </div>

          <label className="convert-lead-modal__field">
            Email *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="convert-lead-modal__field">
            Телефон
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="Оставьте пустым, чтобы взять из карточки"
            />
          </label>

          <label className="convert-lead-modal__field">
            Студия *
            {isLoadingStudios ? (
              <div className="convert-lead-modal__loading">
                Загрузка студий...
              </div>
            ) : studiosError ? (
              <div className="convert-lead-modal__field-error">
                {studiosError}
              </div>
            ) : (
              <select
                value={studioId}
                onChange={(e) =>
                  setStudioId(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <option value="">— выберите студию —</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        <div className="convert-lead-modal__footer">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="convert-lead-modal__btn convert-lead-modal__btn--secondary"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || isLoadingStudios}
            className="convert-lead-modal__btn convert-lead-modal__btn--primary"
          >
            {isSubmitting ? 'Конвертация...' : 'Конвертировать'}
          </button>
        </div>
      </div>
    </div>
  );
};