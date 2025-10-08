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

  // Используем данные из store или показываем нули
  const stats = dashboardStats || {
    totalUsers: 0,
    totalStudios: 0,
    activeTeachers: 0,
    activeStudents: 0,
    totalComments: 0,
    totalActivities: 0,
  };

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Панель администратора</h1>
          <p className="welcome-text">
            Добро пожаловать, <strong>{user?.full_name || 'Администратор'}</strong>
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <h3>Всего пользователей</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon studios">🏢</div>
          <div className="stat-content">
            <h3>Студии</h3>
            <p className="stat-value">{stats.totalStudios}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teachers">👨‍🏫</div>
          <div className="stat-content">
            <h3>Преподаватели</h3>
            <p className="stat-value">{stats.activeTeachers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon students">🎓</div>
          <div className="stat-content">
            <h3>Студенты</h3>
            <p className="stat-value">{stats.activeStudents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lessons">💬</div>
          <div className="stat-content">
            <h3>Комментариев</h3>
            <p className="stat-value">{stats.totalComments}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon approvals">📊</div>
          <div className="stat-content">
            <h3>Активностей</h3>
            <p className="stat-value">{stats.totalActivities}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Быстрые действия</h2>
        <div className="actions-grid">
          <Link to={ROUTES.ADMIN.USERS} className="action-card">
            <div className="action-icon">👤</div>
            <h3>Управление пользователями</h3>
            <p>Просмотр и редактирование пользователей</p>
          </Link>

          <Link to={ROUTES.ADMIN.STUDIOS} className="action-card">
            <div className="action-icon">🏢</div>
            <h3>Управление студиями</h3>
            <p>Создание и настройка студий</p>
          </Link>

          <Link to={ROUTES.ADMIN.STATISTICS} className="action-card">
            <div className="action-icon">📊</div>
            <h3>Статистика</h3>
            <p>Просмотр аналитики и отчетов</p>
          </Link>

          <div className="action-card disabled">
            <div className="action-icon">⚙️</div>
            <h3>Настройки системы</h3>
            <p>Скоро будет доступно</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Последняя активность</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📊</div>
            <div className="activity-content">
              <p><strong>Система готова</strong> к работе</p>
              <span className="activity-time">Все сервисы запущены</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👥</div>
            <div className="activity-content">
              <p><strong>Пользователей:</strong> {stats.totalUsers}</p>
              <span className="activity-time">Студентов: {stats.activeStudents}, Преподавателей: {stats.activeTeachers}</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🏢</div>
            <div className="activity-content">
              <p><strong>Студий:</strong> {stats.totalStudios}</p>
              <span className="activity-time">Активных студий в системе</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;