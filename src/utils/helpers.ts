/**
 * Вспомогательные функции
 */

/**
 * Форматирование имени пользователя
 */
export const formatUserName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Пользователь';
  if (!firstName) return lastName || '';
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

/**
 * Получение инициалов пользователя
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || 'U';
};

/**
 * Форматирование номера телефона
 */
export const formatPhoneNumber = (phone: string): string => {
  // Удаляем все кроме цифр
  const cleaned = phone.replace(/\D/g, '');
  
  // Форматируем в +7 (XXX) XXX-XX-XX
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
};

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация пароля (минимум 8 символов)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Проверка силы пароля
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 8) {
    return { strength: 'weak', message: 'Слишком короткий' };
  }
  
  let score = 0;
  
  // Длина
  if (password.length >= 12) score++;
  
  // Есть цифры
  if (/\d/.test(password)) score++;
  
  // Есть строчные буквы
  if (/[a-z]/.test(password)) score++;
  
  // Есть заглавные буквы
  if (/[A-Z]/.test(password)) score++;
  
  // Есть спецсимволы
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    return { strength: 'weak', message: 'Слабый пароль' };
  } else if (score <= 4) {
    return { strength: 'medium', message: 'Средний пароль' };
  } else {
    return { strength: 'strong', message: 'Сильный пароль' };
  }
};

/**
 * Задержка (debounce)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Преобразование роли в читаемый текст
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: 'Администратор',
    teacher: 'Преподаватель',
    student: 'Студент',
    guest: 'Гость',
  };
  
  return roleMap[role] || role;
};

/**
 * Форматирование даты
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Форматирование времени
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматирование даты и времени
 */
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} в ${formatTime(date)}`;
};

/**
 * Проверка, истек ли токен
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // конвертируем в миллисекунды
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

/**
 * Копирование в буфер обмена
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Скачивание файла
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Получение цвета для роли (для UI)
 */
export const getRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    admin: '#dc3545',
    teacher: '#667eea',
    student: '#28a745',
    guest: '#6c757d',
  };
  
  return colorMap[role] || '#6c757d';
};