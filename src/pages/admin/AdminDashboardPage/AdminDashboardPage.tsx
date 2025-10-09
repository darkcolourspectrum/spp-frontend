import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/modules/admin/store/adminSlice/actionCreators';
import './adminDashboardPage.css';

const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  // Получаем данные из Redux store
  const { dashboardStats, isLoadingDashboard, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    // При монтировании компонента загружаем статистику
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoadingDashboard && !dashboardStats) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardStats) {
    return (
      <div className="admin-dashboard-page">
        <div className="error-state">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button 
            onClick={() => dispatch(fetchDashboardStats())} 
            className="retry-button"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Панель администратора</h1>
          <p className="welcome-text">
            Добро пожаловать, <strong>{user?.full_name || user?.email}</strong>!
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.totalUsers || 0}</div>
            <div className="stat-label">Всего пользователей</div>
            <div className="stat-details">
                <br/>
                <span>Студентов: {dashboardStats?.activeStudents || 0}</span>
                <br/>
                <span>Преподавателей: {dashboardStats?.activeTeachers || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon profiles-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.totalComments || 0}</div>
            <div className="stat-label">Всего комментариев</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activities-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.totalActivities || 0}</div>
            <div className="stat-label">Активностей пользователей</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.totalStudios || 0}</div>
            <div className="stat-label">Студий (скоро)</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Быстрые действия</h2>
        <div className="actions-grid">
          <Link to={ROUTES.ADMIN.USERS} className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Управление пользователями</h3>
              <p>Добавление, редактирование и удаление пользователей</p>
            </div>
          </Link>

          <Link to={ROUTES.ADMIN.STUDIOS} className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Управление студиями</h3>
              <p>Настройка студий и назначение преподавателей</p>
            </div>
          </Link>

          <Link to={ROUTES.ADMIN.STATISTICS} className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Статистика и отчеты</h3>
              <p>Подробная аналитика системы</p>
            </div>
          </Link>

          <Link to={ROUTES.PROFILE} className="action-card">
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Модерация комментариев</h3>
              <p>Проверка и модерация отзывов пользователей</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;