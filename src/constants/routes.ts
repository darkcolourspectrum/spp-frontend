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
    STUDIO_DETAIL: '/admin/studios/:studioId',  // ← НОВЫЙ МАРШРУТ
    STATISTICS: '/admin/statistics',
  },
  
  // Преподаватель маршруты
  TEACHER: {
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
      return ROUTES.TEACHER.SCHEDULE;
    case 'student':
      return ROUTES.STUDENT.SCHEDULE;
    case 'guest':
      return ROUTES.GUEST.LESSONS;
    default:
      return ROUTES.DASHBOARD;
  }
};

/**
 * Хелпер для генерации пути к детальной странице студии
 */
export const getStudioDetailRoute = (studioId: number): string => {
  return `/admin/studios/${studioId}`;
};