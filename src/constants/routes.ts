/**
 * Константы для маршрутов приложения
 * Используй эти константы вместо хардкода строк
 */

export const ROUTES = {
  // Публичные маршруты
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  
  // Общие защищенные маршруты
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  
  // Админ маршруты
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    STUDIOS: '/admin/studios',
    STUDIO_DETAIL: '/admin/studios/:studioId',
    STATISTICS: '/admin/statistics',
  },
  
  // Преподаватель маршруты
  TEACHER: {
    STUDIOS: '/teacher/studios',
    STUDIO_DETAIL: '/teacher/studios/:studioId',
    SCHEDULE: '/teacher/schedule',
    LESSONS: '/teacher/lessons',
    STUDENTS: '/teacher/students',
    PROFILE: '/teacher/profile',
  },
  
  // Студент маршруты
  STUDENT: {
    SCHEDULE: '/student/schedule',
    LESSONS: '/student/lessons',
    PROFILE: '/student/profile',
    ENROLLMENT: '/student/enrollment',
  },
  
  // Гость маршруты
  GUEST: {
    LESSONS: '/guest/lessons',
    ENROLLMENT: '/guest/enrollment',
  },
} as const;

/**
 * Получить дефолтный маршрут для роли
 */
export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'teacher':
      return ROUTES.TEACHER.STUDIOS;  // ← ИЗМЕНЕНО: теперь по умолчанию студии
    case 'student':
      return ROUTES.STUDENT.SCHEDULE;
    case 'guest':
      return ROUTES.GUEST.LESSONS;
    default:
      return ROUTES.DASHBOARD;
  }
};

/**
 * Путь к детальной странице студии для админа.
 */
export const getAdminStudioDetailRoute = (studioId: number): string => {
  return `/admin/studios/${studioId}`;
};

/**
 * Путь к детальной странице студии для преподавателя.
 */
export const getTeacherStudioDetailRoute = (studioId: number): string => {
  return `/teacher/studios/${studioId}`;
};

/**
 * @deprecated Используй getAdminStudioDetailRoute или getTeacherStudioDetailRoute.
 * Оставлено для обратной совместимости со старым кодом.
 */
export const getStudioDetailRoute = getAdminStudioDetailRoute;