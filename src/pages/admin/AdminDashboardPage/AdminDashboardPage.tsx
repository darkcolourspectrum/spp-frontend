import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats, fetchAllUsers, fetchAllStudios } from '@/modules/admin/store';
import StatsCards from './components/StatsCards';
import RoleDistributionChart from './components/RoleDistributionChart';
import StudiosChart from './components/StudiosChart';
import RecentActivity from './components/RecentActivity';
import SystemAlerts from './components/SystemAlerts';
import './adminDashboardPage.css';

const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const { dashboardStats, users, studios, isLoadingDashboard, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllUsers());
    dispatch(fetchAllStudios());
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
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Панель администратора</h1>
          <p className="welcome-text">
            Добро пожаловать, <strong>{user?.full_name || user?.email}</strong>!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} />

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Распределение по ролям</h3>
          <RoleDistributionChart 
            students={dashboardStats?.activeStudents || 0}
            teachers={dashboardStats?.activeTeachers || 0}
            total={dashboardStats?.totalUsers || 0}
          />
        </div>
        
        <div className="chart-card">
          <h3>Студии и кабинеты</h3>
          <StudiosChart studios={studios} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="activity-section">
          <h3>Последние действия</h3>
          <RecentActivity users={users} studios={studios} />
        </div>
        
        <div className="alerts-section">
          <h3>Системные предупреждения</h3>
          <SystemAlerts 
            users={users} 
            studios={studios}
            stats={dashboardStats}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;