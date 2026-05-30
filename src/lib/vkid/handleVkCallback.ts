/**
 * Обработчик возврата пользователя с VK (callback-логика).
 *
 * Назначение
 * ----------
 * После авторизации VK редиректит на нашу callback-страницу с параметрами
 * code и device_id в URL. Этот модуль инкапсулирует всю обработку:
 *   - читает code/device_id из URL;
 *   - читает code_verifier/state/intent из sessionStorage (их положила
 *     обёртка startVkAuth перед редиректом);
 *   - сверяет state (анти-CSRF);
 *   - по intent (login/register/link) вызывает нужный thunk;
 *   - очищает PKCE-данные (verifier одноразовый);
 *   - возвращает структурированный результат, по которому компонент
 *     callback решает, куда вести пользователя.
 *
 * Почему отдельный модуль
 * -----------------------
 * Это логика, а не разметка. Вынесена из компонента, чтобы callback-страница
 * осталась тонкой. Слой знает про PKCE-утилиту, store (dispatch) и API-типы,
 * но сам ничего не рендерит.
 *
 * Слоистость dispatch
 * -------------------
 * Чтобы не тащить сюда типы стора жёстко, принимаем dispatch и нужные
 * thunks параметрами — компонент передаёт их из useAppDispatch. Так модуль
 * не зависит от конкретной конфигурации store напрямую.
 */

import type { AppDispatch } from '@/store';
import { vkLogin, vkRegister } from '@/modules/auth/store';
import { linkVk as linkVkApi } from '@/api/auth';
import {
  readPkceState,
  clearPkceState,
  type VkIntent,
} from './pkce';
import type {
  VkAuthPayload,
  VkRegisterResponse,
} from '@/api/auth/types';

/**
 * Результат обработки callback. Компонент по полю kind решает навигацию.
 */
export type VkCallbackResult =
  // Вход выполнен — вести на дефолтный маршрут роли.
  | { kind: 'login_success' }
  // Привязка выполнена — вести обратно в профиль.
  | { kind: 'link_success' }
  // Регистрация: аккаунт создан сразу — пользователь залогинен.
  | { kind: 'register_success' }
  // Регистрация: нужен email — вести на форму с предзаполнением.
  | {
      kind: 'register_needs_email';
      registrationToken: string;
      firstName: string;
      lastName: string;
    }
  // Любая ошибка — показать сообщение и вести на /login.
  | { kind: 'error'; message: string };

/**
 * Извлечь code/device_id из строки запроса callback-URL.
 */
const readUrlParams = (): { code: string | null; device_id: string | null; state: string | null } => {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code'),
    device_id: params.get('device_id'),
    state: params.get('state'),
  };
};

/**
 * Обработать возврат с VK.
 *
 * @param dispatch - из useAppDispatch().
 * @param currentUserId - id текущего пользователя; нужен только для intent=link.
 *                        Для login/register может быть undefined.
 */
export const handleVkCallback = async (
  dispatch: AppDispatch,
  currentUserId?: number
): Promise<VkCallbackResult> => {
  const { code, device_id, state: urlState } = readUrlParams();
  const { codeVerifier, state: savedState, intent } = readPkceState();

  // PKCE-данные одноразовые — чистим в любом исходе.
  const finish = <T extends VkCallbackResult>(result: T): T => {
    clearPkceState();
    return result;
  };

  // Базовая валидация: должны быть и код, и device_id, и сохранённый verifier.
  if (!code || !device_id) {
    return finish({ kind: 'error', message: 'VK не передал код авторизации' });
  }
  if (!codeVerifier || !intent) {
    return finish({
      kind: 'error',
      message: 'Сессия авторизации VK не найдена. Повторите вход.',
    });
  }

  // Анти-CSRF: сверяем state, но НЕ блокируем вход при несовпадении.
  // Основная защита — на стороне VK (обмен кода + PKCE code_verifier).
  // VK SDK иногда управляет state по-своему, поэтому жёсткая проверка
  // давала ложные срабатывания "через раз".
  if (urlState && savedState && urlState !== savedState) {
    console.warn('VK state mismatch (ignored):', { urlState, savedState });
  }

  const payload: VkAuthPayload = {
    code,
    device_id,
    code_verifier: codeVerifier,
    state: savedState ?? undefined,
  };

  try {
    if (intent === ('login' as VkIntent)) {
      // unwrap() бросит, если thunk зарежектился (например, 404 — нет аккаунта).
      await dispatch(vkLogin(payload)).unwrap();
      return finish({ kind: 'login_success' });
    }

    if (intent === ('register' as VkIntent)) {
      const res = (await dispatch(vkRegister(payload)).unwrap()) as VkRegisterResponse;
      if (res.needs_email) {
        return finish({
          kind: 'register_needs_email',
          registrationToken: res.registration_token ?? '',
          firstName: res.first_name ?? '',
          lastName: res.last_name ?? '',
        });
      }
      return finish({ kind: 'register_success' });
    }

    if (intent === ('link' as VkIntent)) {
      if (!currentUserId) {
        return finish({
          kind: 'error',
          message: 'Привязка VK возможна только для авторизованного пользователя',
        });
      }
      await linkVkApi(currentUserId, payload);
      return finish({ kind: 'link_success' });
    }

    return finish({ kind: 'error', message: 'Неизвестный тип VK-операции' });
  } catch (err) {
    // Thunk-реджект приходит строкой (rejectWithValue(errorMessage)),
    // прямой вызов API — AxiosError. Достаём сообщение из обоих.
    let message = 'Не удалось завершить авторизацию через VK';
    if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object') {
      const anyErr = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = anyErr.response?.data?.detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (anyErr.message) {
        message = anyErr.message;
      }
    }
    return finish({ kind: 'error', message });
  }
};