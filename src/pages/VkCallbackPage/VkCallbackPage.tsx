/**
 * Callback-страница возврата с VK.
 *
 * Назначение
 * ----------
 * VK после авторизации редиректит сюда (URL из VITE_VK_REDIRECT_URL).
 * Страница тонкая: при монтировании вызывает handleVkCallback (вся логика
 * там), показывает индикатор, а по результату навигирует пользователя.
 *
 * Навигация по исходам:
 *   - login_success / register_success: пользователь залогинен ->
 *     на дефолтный маршрут его роли.
 *   - link_success: вернуть в профиль.
 *   - register_needs_email: на форму регистрации с предзаполнением
 *     (токен и имя передаём через location.state).
 *   - error: показать сообщение, дать уйти на /login.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { handleVkCallback } from '@/lib/vkid/handleVkCallback';
import { ROUTES, getDefaultRouteForRole } from '@/constants/routes';

const VkCallbackPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Текущий пользователь нужен для intent=link (привязка).
  const currentUser = useAppSelector((state) => state.auth.user);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Strict-mode в dev монтирует эффекты дважды — защищаемся от двойного
  // вызова обмена (код одноразовый!).
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    (async () => {
      const result = await handleVkCallback(dispatch, currentUser?.id);

      switch (result.kind) {
        case 'login_success':
        case 'register_success': {
          // Пользователь уже в сторе (setAuth). Берём роль из стора.
          const role = currentUser?.role;
          navigate(role ? getDefaultRouteForRole(role) : ROUTES.HOME, { replace: true });
          break;
        }

        case 'link_success':
          navigate(ROUTES.PROFILE, { replace: true });
          break;

        case 'register_needs_email':
          // Ведём на форму регистрации, передаём данные для предзаполнения
          // и второго шага (токен).
          navigate(ROUTES.REGISTER, {
            replace: true,
            state: {
              vkNeedsEmail: true,
              registrationToken: result.registrationToken,
              firstName: result.firstName,
              lastName: result.lastName,
            },
          });
          break;

        case 'error':
        default:
          setErrorMessage(result.kind === 'error' ? result.message : 'Ошибка авторизации VK');
          break;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMessage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: '#c33', fontSize: 16 }}>{errorMessage}</p>
        <button
          onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', cursor: 'pointer' }}
        >
          Вернуться ко входу
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 16, color: '#555' }}>Завершаем авторизацию через VK...</p>
    </div>
  );
};

export default VkCallbackPage;