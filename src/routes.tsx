/**
 * Роутинг приложения с Layout системой
 */

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { ROUTES, getDefaultRouteForRole } from './constants/routes';
import { PublicLayout, PrivateLayout } from './modules/shared/components/Layout/Layouts';

// Auth Components
import Login from './modules/auth/components/Login';
import Register from './modules/auth/components/Register';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';

// Admin Pages - РЕАЛЬНЫЕ КОМПОНЕНТЫ
import { AdminDashboardPage, AdminUsersPage } from './pages/admin';

// Other Pages
import StudentProfilePage from './pages/StudentProfilePage';

// Временные placeholder компоненты (оставшиеся)
const Dashboard = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Dashboard</h1>
    <p>Добро пожаловать в систему!</p>
  </div>
);

const AdminStudios = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Управление студиями</h1>
    <p>Список всех студий (в разработке)</p>
  </div>
);

const AdminStatistics = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Статистика</h1>
    <p>Аналитика и отчеты (в разработке)</p>
  </div>
);

const TeacherSchedule = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Расписание преподавателя</h1>
    <p>Управление уроками</p>
  </div>
);

const TeacherStudents = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Мои студенты</h1>
    <p>Список студентов</p>
  </div>
);

const TeacherProfile = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Профиль преподавателя</h1>
    <p>Ваш профиль</p>
  </div>
);

const StudentSchedule = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Расписание студента</h1>
    <p>Запись на уроки</p>
  </div>
);

const StudentProfile = () => (
  <StudentProfilePage />
);

const ProfilePage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Мой профиль</h1>
    <p>Общий профиль пользователя</p>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Определяем редирект для главной страницы
  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) {
      return ROUTES.LOGIN;
    }
    return getDefaultRouteForRole(user.role);
  };
  
  return (
    <Routes>
      {/* ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ==================== */}
      {/* Используем PublicLayout - БЕЗ Header/Footer */}
      <Route element={<PublicLayout><Outlet /></PublicLayout>}>
        <Route 
          path={ROUTES.LOGIN} 
          element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login />} 
        />
        <Route 
          path={ROUTES.REGISTER} 
          element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Register />} 
        />
      </Route>
      
      {/* ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ==================== */}
      {/* Используем PrivateLayout - С Header/Footer */}
      <Route element={
        <PrivateLayout>
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </PrivateLayout>
      }>
        {/* Общие защищенные маршруты */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        
        {/* ==================== АДМИН МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN.STUDIOS} element={<AdminStudios />} />
          <Route path={ROUTES.ADMIN.STATISTICS} element={<AdminStatistics />} />
        </Route>
        
        {/* ==================== ПРЕПОДАВАТЕЛЬ МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['teacher', 'admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.TEACHER.SCHEDULE} element={<TeacherSchedule />} />
          <Route path={ROUTES.TEACHER.STUDENTS} element={<TeacherStudents />} />
          <Route path={ROUTES.TEACHER.PROFILE} element={<TeacherProfile />} />
        </Route>
        
        {/* ==================== СТУДЕНТ МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['student', 'admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.STUDENT.SCHEDULE} element={<StudentSchedule />} />
          <Route path={ROUTES.STUDENT.PROFILE} element={<StudentProfile />} />
        </Route>
      </Route>
      
      {/* ==================== СПЕЦИАЛЬНЫЕ МАРШРУТЫ ==================== */}
      {/* Главная страница - редирект */}
      <Route 
        path={ROUTES.HOME} 
        element={<Navigate to={getDefaultRedirect()} replace />} 
      />
      
      {/* 404 */}
      <Route 
        path="*" 
        element={
          <PrivateLayout>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>404</h1>
              <p>Страница не найдена</p>
            </div>
          </PrivateLayout>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;