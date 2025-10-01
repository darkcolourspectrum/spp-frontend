/**
 * Компонент для защиты маршрутов
 * Проверяет аутентификацию и роли пользователя
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/api/auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  
  // Показываем loader пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        Загрузка...
      </div>
    );
  }
  
  // Если не аутентифицирован - редирект на логин
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Если указаны требуемые роли - проверяем
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      // Пользователь не имеет нужной роли
      // Редирект на дефолтную страницу для его роли
      const { getDefaultRouteForRole } = require('@/constants/routes');
      return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
    }
  }
  
  // Всё ок - показываем контент
  return <>{children}</>;
};

export default ProtectedRoute;