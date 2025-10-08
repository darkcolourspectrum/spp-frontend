import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import './adminDashboardPage.css';

interface DashboardStats {
  totalUsers: number;
  totalStudios: number;
  activeTeachers: number;
  activeStudents: number;
  totalLessons: number;
  pendingApprovals: number;
}

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudios: 0,
    activeTeachers: 0,
    activeStudents: 0,
    totalLessons: 0,
    pendingApprovals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // TODO: Здесь будет реальный запрос к API
        // const data = await getDashboardStats();
        // setStats(data);
        
        // Пока моковые данные для демонстрации
        setTimeout(() => {
          setStats({
            totalUsers: 127,
            totalStudios: 5,
            activeTeachers: 12,
            activeStudents: 98,
            totalLessons: 456,
            pendingApprovals: 3,
          });
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
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
            <h3>Активные преподаватели</h3>
            <p className="stat-value">{stats.activeTeachers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon students">🎓</div>
          <div className="stat-content">
            <h3>Активные студенты</h3>
            <p className="stat-value">{stats.activeStudents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lessons">📚</div>
          <div className="stat-content">
            <h3>Всего уроков</h3>
            <p className="stat-value">{stats.totalLessons}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon approvals">⏳</div>
          <div className="stat-content">
            <h3>Ожидают одобрения</h3>
            <p className="stat-value">{stats.pendingApprovals}</p>
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
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p><strong>Новый пользователь</strong> зарегистрировался</p>
              <span className="activity-time">5 минут назад</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <p><strong>Урок создан</strong> преподавателем Иваном Петровым</p>
              <span className="activity-time">15 минут назад</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🎓</div>
            <div className="activity-content">
              <p><strong>Студент записался</strong> на урок</p>
              <span className="activity-time">1 час назад</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;