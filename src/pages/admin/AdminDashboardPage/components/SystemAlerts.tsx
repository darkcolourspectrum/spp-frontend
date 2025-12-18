import type { AdminUser, Studio, DashboardStats } from '@/api/admin/types';

interface SystemAlertsProps {
  users: AdminUser[];
  studios: Studio[];
  stats: DashboardStats | null;
}

const SystemAlerts = ({ users, studios, stats }: SystemAlertsProps) => {
  const alerts = [];
  
  // Неактивные студии
  const inactiveStudios = studios.filter(s => !s.is_active);
  if (inactiveStudios.length > 0) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      message: `${inactiveStudios.length} ${inactiveStudios.length === 1 ? 'неактивная студия' : 'неактивных студий'}`,
      action: 'Проверить студии',
    });
  }
  
  // Студии без кабинетов (если есть данные)
  const studiosWithoutClassrooms = stats && stats.totalStudios > 0 && stats.totalClassrooms === 0;
  if (studiosWithoutClassrooms) {
    alerts.push({
      type: 'info',
      icon: 'ℹ️',
      message: 'Есть студии без кабинетов',
      action: 'Добавить кабинеты',
    });
  }
  
  // Пользователи без студии
  const usersWithoutStudio = users.filter(u => !u.studio_id && u.role !== 'admin');
  if (usersWithoutStudio.length > 0) {
    alerts.push({
      type: 'info',
      message: `${usersWithoutStudio.length} ${usersWithoutStudio.length === 1 ? 'пользователь' : 'пользователей'} без студии`,
      action: 'Назначить студии',
    });
  }
  
  // Неактивные пользователи
  const inactiveUsers = users.filter(u => !u.is_active);
  if (inactiveUsers.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${inactiveUsers.length} ${inactiveUsers.length === 1 ? 'неактивный пользователь' : 'неактивных пользователей'}`,
      action: 'Проверить пользователей',
    });
  }
  
  // Если всё хорошо
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      message: 'Система работает нормально',
      action: null,
    });
  }

  return (
    <div className="alerts-list">
      {alerts.map((alert, index) => (
        <div key={index} className={`alert-item ${alert.type}`}>
          <div className="alert-icon">{alert.icon}</div>
          <div className="alert-content">
            <p>{alert.message}</p>
            {alert.action && (
              <span className="alert-action">{alert.action}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemAlerts;