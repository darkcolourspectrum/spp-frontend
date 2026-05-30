/**
 * Обёртка над VK ID Web SDK (@vkid/sdk).
 *
 * Изолирует работу с VK ID SDK: инициализация конфигурации и запуск
 * авторизации с PKCE по redirect-флоу. Компоненты и thunks вызывают
 * функции отсюда, а не дёргают VKID напрямую.
 *
 * Поток (redirect-флоу):
 * 1. startVkAuth(intent): генерируем code_verifier + state, считаем
 *    code_challenge, сохраняем verifier/state/intent в sessionStorage,
 *    инициализируем VKID.Config (режим Redirect) и делаем редирект на VK.
 * 2. Пользователь авторизуется в VK -> VK редиректит на redirectUrl
 *    (наша callback-страница) с code и device_id в query.
 * 3. Callback-страница читает verifier/state/intent из sessionStorage,
 *    шлёт code + device_id + verifier на бэк (login/register/link).
 *
 * Конфигурация (env Vite):
 *   VITE_VK_APP_ID       - ID приложения VK ID
 *   VITE_VK_REDIRECT_URL - URL callback-страницы (совпадает с кабинетом VK)
 */

import * as VKID from '@vkid/sdk';

import {
  generateCodeVerifier,
  generateState,
  computeCodeChallenge,
  savePkceState,
  type VkIntent,
} from './pkce';

const VK_APP_ID = import.meta.env.VITE_VK_APP_ID as string | undefined;
const VK_REDIRECT_URL = import.meta.env.VITE_VK_REDIRECT_URL as string | undefined;

/**
 * Настроен ли VK ID. UI скрывает кнопку VK, если интеграция не настроена.
 */
export const isVkConfigured = (): boolean =>
  Boolean(VK_APP_ID && VK_REDIRECT_URL);

/**
 * Запустить авторизацию через VK (redirect-флоу).
 *
 * Генерирует PKCE-данные, сохраняет их и intent в sessionStorage,
 * инициализирует VKID.Config в режиме Redirect и редиректит на VK.
 *
 * @param intent - вход, регистрация или привязка (нужно callback-странице).
 * @throws Error, если VK ID не сконфигурирован.
 */
export const startVkAuth = async (intent: VkIntent): Promise<void> => {
  if (!VK_APP_ID || !VK_REDIRECT_URL) {
    throw new Error(
      'VK ID не настроен: задайте VITE_VK_APP_ID и VITE_VK_REDIRECT_URL'
    );
  }

  const codeVerifier = generateCodeVerifier();
  const state = generateState();
  const codeChallenge = await computeCodeChallenge(codeVerifier);

  // Сохраняем ДО редиректа - после возврата страница перезагрузится.
  savePkceState(codeVerifier, state, intent);

  VKID.Config.init({
    app: Number(VK_APP_ID),
    redirectUrl: VK_REDIRECT_URL,
    state,
    codeChallenge,
    scope: 'email',
    // Режим полного редиректа (а не новой вкладки/окна). Без этого SDK
    // открывает новую вкладку и шлёт события через postMessage, что даёт
    // ошибку "Event is not supported" в нашем redirect-флоу.
    mode: VKID.ConfigAuthMode.Redirect,
  });

  // Полный редирект на VK. После авторизации VK вернёт на redirectUrl
  // с параметрами code и device_id.
  await VKID.Auth.login();
};