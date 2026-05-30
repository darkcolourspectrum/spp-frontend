/**
 * Секция привязки VK в профиле пользователя.
 *
 * Показывает статус привязки VK и кнопку привязать/отвязать:
 *   - не привязан -> "Привязать VK": startVkAuth('link') редиректит на VK,
 *     после возврата callback-страница вызовет linkVk;
 *   - привязан -> "Отвязать VK": прямой вызов API unlinkVk, затем
 *     перечитываем /me (fetchCurrentUser), чтобы обновить флаг vk_linked.
 *
 * Статус привязки берём из auth-стора (user.vk_linked) — бэк отдаёт его
 * в ответе /auth/me. Если VK не сконфигурирован (нет env) — секция скрыта.
 *
 * Слой: UI-компонент модуля profile. Использует store (через хуки),
 * API (unlinkVk) и инфраструктуру VK (startVkAuth). Логику привязки
 * (обмен кода) не дублирует — она в callback-флоу.
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/modules/auth/store';
import { unlinkVk } from '@/api/auth';
import { startVkAuth, isVkConfigured } from '@/lib/vkid/vkidClient';
import '@/modules/auth/components/vkAuth.css';

const VkLinkSection = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Секцию не показываем, если VK не настроен или нет пользователя.
  if (!isVkConfigured() || !user) {
    return null;
  }

  // Бэк отдаёт vk_linked в /auth/me. Поле опциональное — трактуем отсутствие
  // как "не привязан".
  const isLinked = Boolean((user as { vk_linked?: boolean }).vk_linked);

  const handleLink = async () => {
    setError(null);
    try {
      // intent='link' — после возврата callback вызовет linkVk.
      await startVkAuth('link');
      // редирект на VK; код ниже не выполнится
    } catch {
      setError('Не удалось начать привязку VK');
    }
  };

  const handleUnlink = async () => {
    setError(null);
    setIsWorking(true);
    try {
      await unlinkVk(user.id);
      // Обновляем данные пользователя, чтобы vk_linked стал false.
      await dispatch(fetchCurrentUser()).unwrap();
    } catch {
      setError('Не удалось отвязать VK');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="profile-section">
      <h2 className="section-title">Привязка VK</h2>

      {error && (
        <p style={{ color: '#c33', marginBottom: 12, fontSize: 14 }}>{error}</p>
      )}

      {isLinked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="info-value status-badge verified">VK привязан</span>
          <button
            type="button"
            className="vk-auth-button vk-auth-button--secondary"
            onClick={handleUnlink}
            disabled={isWorking}
          >
            {isWorking ? 'Отвязываем...' : 'Отвязать VK'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#777', fontSize: 14 }}>
            VK не привязан. Вы можете входить через VK после привязки.
          </span>
          <button
            type="button"
            className="vk-auth-button"
            onClick={handleLink}
          >
            Привязать VK
          </button>
        </div>
      )}
    </div>
  );
};

export default VkLinkSection;