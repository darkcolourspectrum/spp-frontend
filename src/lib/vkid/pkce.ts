/**
 * PKCE-утилита для VK ID авторизации.
 *
 * Назначение
 * ----------
 * VK ID использует OAuth 2.1 + PKCE. Перед открытием окна VK мы генерируем
 * случайный code_verifier и из него code_challenge. Окно VK получает
 * challenge, а при обмене кода на бэке предъявляется исходный verifier -
 * VK сверяет их. Это защищает от перехвата кода авторизации.
 *
 * Почему sessionStorage
 * ---------------------
 * Между "пользователь нажал кнопку" и "вернулся с VK на callback" страница
 * перезагружается (redirect-флоу), поэтому состояние в памяти (Redux/React)
 * теряется. code_verifier и state нужно пережить редирект - кладём их в
 * sessionStorage (живёт в пределах вкладки) и удаляем сразу после обмена.
 *
 * code_verifier - НЕ токен доступа, а одноразовая PKCE-строка с коротким
 * временем жизни. Это согласуется с политикой "access-токен только в памяти":
 * долгоживущие секреты доступа в storage не попадают.
 *
 * Слой
 * ----
 * Чистые функции + работа с sessionStorage/WebCrypto. Не знает про Redux,
 * React, axios. Используется обёрткой SDK и callback-страницей.
 */

// Ключи в sessionStorage. Префикс vkid_ чтобы не пересекаться с чужими.
const STORAGE_KEYS = {
  codeVerifier: 'vkid_code_verifier',
  state: 'vkid_state',
  // Намерение: что пользователь начинал - вход, регистрацию или привязку.
  // Нужно на callback, чтобы понять, какой бэкенд-эндпоинт звать.
  intent: 'vkid_intent',
} as const;

export type VkIntent = 'login' | 'register' | 'link';

/**
 * Сгенерировать криптографически случайную строку из [A-Za-z0-9-._~]
 * (unreserved-символы, разрешённые в PKCE code_verifier по RFC 7636).
 * Длина 64 символа - в пределах требований (43..128).
 */
const generateRandomString = (length = 64): string => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
};

/**
 * Base64URL-кодирование ArrayBuffer (без '=', с '-' и '_').
 */
const base64UrlEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Вычислить code_challenge из code_verifier методом S256
 * (SHA-256 -> base64url). Это то, что уходит в окно VK.
 */
export const computeCodeChallenge = async (
  codeVerifier: string
): Promise<string> => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
};

/**
 * Сгенерировать новый code_verifier.
 */
export const generateCodeVerifier = (): string => generateRandomString(64);

/**
 * Сгенерировать новый state (анти-CSRF).
 */
export const generateState = (): string => generateRandomString(32);

/**
 * Сохранить PKCE-данные и намерение перед редиректом на VK.
 */
export const savePkceState = (
  codeVerifier: string,
  state: string,
  intent: VkIntent
): void => {
  sessionStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.state, state);
  sessionStorage.setItem(STORAGE_KEYS.intent, intent);
};

/**
 * Прочитать сохранённые PKCE-данные на callback-странице.
 * Возвращает null-поля, если чего-то нет (например, прямой заход на callback).
 */
export const readPkceState = (): {
  codeVerifier: string | null;
  state: string | null;
  intent: VkIntent | null;
} => ({
  codeVerifier: sessionStorage.getItem(STORAGE_KEYS.codeVerifier),
  state: sessionStorage.getItem(STORAGE_KEYS.state),
  intent: sessionStorage.getItem(STORAGE_KEYS.intent) as VkIntent | null,
});

/**
 * Очистить PKCE-данные. Вызывается сразу после обмена кода (успех или
 * ошибка) - verifier одноразовый, его нельзя переиспользовать.
 */
export const clearPkceState = (): void => {
  sessionStorage.removeItem(STORAGE_KEYS.codeVerifier);
  sessionStorage.removeItem(STORAGE_KEYS.state);
  sessionStorage.removeItem(STORAGE_KEYS.intent);
};