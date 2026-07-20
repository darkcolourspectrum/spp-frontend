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

// Admin Pages
import { AdminDashboardPage, AdminUsersPage, AdminStudiosPage, StudioDetailPage, AdminCrmPage } from './pages/admin';
// Teacher Pages
import TeacherStudiosPage from './pages/teacher/TeacherStudiosPage';
import TeacherStudioDetailPage from './pages/teacher/TeacherStudiosDetailPage';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
// Student Pages
import StudentSchedulePage from './pages/student/StudentSchedulePage';

// Profile Page (универсальная для всех ролей)
import UserProfilePage from './pages/UserProfilePage';

import VkCallbackPage from './pages/VkCallbackPage/VkCallbackPage';


const AppRoutes = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) {
      return ROUTES.LOGIN;
    }
    return getDefaultRouteForRole(user.role);
  };
  
  return (
    <Routes>
      {/* ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ==================== */}
      <Route element={<PublicLayout><Outlet /></PublicLayout>}>
        <Route 
          path={ROUTES.LOGIN} 
          element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login />} 
        />
        <Route 
          path={ROUTES.REGISTER} 
          element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Register />} 
        />
        <Route 
          path={ROUTES.VK_CALLBACK} 
          element={<VkCallbackPage />} 
        />
      </Route>
      
      {/* ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ==================== */}
      <Route element={
        <PrivateLayout>
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </PrivateLayout>
      }>
        {/* Общие защищенные маршруты */}
        <Route path={ROUTES.PROFILE} element={<UserProfilePage />} />
        
        {/* ==================== АДМИН МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN.STUDIOS} element={<AdminStudiosPage />} />
          <Route path={ROUTES.ADMIN.CRM} element={<AdminCrmPage />} />
        </Route>
        
        {/* Детальная страница студии для админа */}
        <Route element={<ProtectedRoute requiredRoles={['admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.ADMIN.STUDIO_DETAIL} element={<StudioDetailPage />} />
        </Route>

        {/* ==================== ПРЕПОДАВАТЕЛЬ МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['teacher', 'admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.TEACHER.STUDIOS} element={<TeacherStudiosPage />} />
          <Route path={ROUTES.TEACHER.STUDIO_DETAIL} element={<TeacherStudioDetailPage />} />
          <Route path={ROUTES.TEACHER.SCHEDULE} element={<TeacherSchedulePage />} />
          <Route path={ROUTES.TEACHER.PROFILE} element={<UserProfilePage />} />
        </Route>
        
        {/* ==================== СТУДЕНТ МАРШРУТЫ ==================== */}
        <Route element={<ProtectedRoute requiredRoles={['student', 'admin']}><Outlet /></ProtectedRoute>}>
          <Route path={ROUTES.STUDENT.SCHEDULE} element={<StudentSchedulePage />} />
          <Route path={ROUTES.STUDENT.PROFILE} element={<UserProfilePage />} />
        </Route>
      </Route>
      
      {/* ==================== СПЕЦИАЛЬНЫЕ МАРШРУТЫ ==================== */}
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