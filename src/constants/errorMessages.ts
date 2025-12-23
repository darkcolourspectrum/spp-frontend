
export const ERROR_MESSAGES = {
  // Общие ошибки
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка. Попробуйте позже.',
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  
  // Ошибки аутентификации
  AUTH: {
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    USER_NOT_FOUND: 'Пользователь не найден',
    EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',
    ACCOUNT_LOCKED: 'Аккаунт заблокирован. Попробуйте позже.',
    SESSION_EXPIRED: 'Сессия истекла. Войдите снова.',
    UNAUTHORIZED: 'Необходима авторизация',
    FORBIDDEN: 'Недостаточно прав для выполнения действия',
    TOO_MANY_ATTEMPTS: 'Слишком много попыток входа. Попробуйте через несколько минут.',
  },
  
  // Ошибки валидации
  VALIDATION: {
    REQUIRED_FIELD: 'Это поле обязательно для заполнения',
    INVALID_EMAIL: 'Некорректный email адрес',
    INVALID_PHONE: 'Некорректный номер телефона',
    PASSWORD_TOO_SHORT: 'Пароль должен содержать минимум 8 символов',
    PASSWORDS_DONT_MATCH: 'Пароли не совпадают',
    INVALID_NAME: 'Имя должно содержать минимум 2 символа',
    PRIVACY_POLICY_REQUIRED: 'Необходимо принять политику конфиденциальности',
  },
  
  // Ошибки профиля
  PROFILE: {
    NOT_FOUND: 'Профиль не найден',
    UPDATE_FAILED: 'Не удалось обновить профиль',
    AVATAR_TOO_LARGE: 'Размер файла превышает 5 МБ',
    INVALID_FILE_TYPE: 'Неподдерживаемый тип файла',
  },
  
  // Ошибки расписания
  SCHEDULE: {
    SLOT_NOT_AVAILABLE: 'Этот временной слот недоступен',
    LESSON_NOT_FOUND: 'Урок не найден',
    ALREADY_ENROLLED: 'Вы уже записаны на этот урок',
    ENROLLMENT_CLOSED: 'Запись на урок закрыта',
    CANCELLATION_FAILED: 'Не удалось отменить урок',
  },
} as const;

/**
 * Получить понятное сообщение об ошибке из API response
 */
export const getErrorMessage = (error: any): string => {
  // Если есть детальное сообщение от API
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  // По статус коду
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Неверные данные запроса';
      case 401:
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.AUTH.FORBIDDEN;
      case 404:
        return 'Ресурс не найден';
      case 409:
        return ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS;
      case 429:
        return ERROR_MESSAGES.AUTH.TOO_MANY_ATTEMPTS;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  
  // Если нет ответа от сервера
  if (error?.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Дефолтное сообщение
  return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};