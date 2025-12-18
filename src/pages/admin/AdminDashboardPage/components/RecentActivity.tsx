import type { AdminUser, Studio } from '@/api/admin/types';

interface RecentActivityProps {
  users: AdminUser[];
  studios: Studio[];
}

const RecentActivity = ({ users, studios }: RecentActivityProps) => {
  // Берем последних 5 пользователей по дате создания
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  // Берем последние 3 студии
  const recentStudios = [...studios]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="activity-list">
      {recentUsers.length === 0 && recentStudios.length === 0 ? (
        <div className="empty-activity">
          <p>Нет недавних действий</p>
        </div>
      ) : (
        <>
          {recentUsers.map((user) => (
            <div key={`user-${user.id}`} className="activity-item">
              <div className="activity-icon user-icon">👤</div>
              <div className="activity-content">
                <p>
                  <strong>{user.full_name}</strong> зарегистрирован
                </p>
                <span className="activity-time">{formatDate(user.created_at)}</span>
              </div>
              <div className="activity-badge">{user.role}</div>
            </div>
          ))}
          
          {recentStudios.map((studio) => (
            <div key={`studio-${studio.id}`} className="activity-item">
              <div className="activity-icon studio-icon"></div>
              <div className="activity-content">
                <p>
                  Студия <strong>{studio.name}</strong> создана
                </p>
                <span className="activity-time">{formatDate(studio.created_at)}</span>
              </div>
              <div className="activity-badge success">Новая</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RecentActivity;