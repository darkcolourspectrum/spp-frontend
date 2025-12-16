import type { DashboardStats } from '@/api/admin/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Всего пользователей',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'blue',
      details: [
        { label: 'Студенты', value: stats?.activeStudents || 0 },
        { label: 'Учителя', value: stats?.activeTeachers || 0 },
      ],
    },
    {
      title: 'Студии',
      value: stats?.totalStudios || 0,
      icon: '🏫',
      color: 'purple',
      details: [
        { label: 'Всего кабинетов', value: stats?.totalClassrooms || 0 },
        { label: 'Активных', value: stats?.activeClassrooms || 0 },
      ],
    },
    {
      title: 'Кабинеты',
      value: stats?.totalClassrooms || 0,
      icon: '🚪',
      color: 'green',
      details: [
        { label: 'Активных', value: stats?.activeClassrooms || 0 },
        { label: 'Неактивных', value: (stats?.totalClassrooms || 0) - (stats?.activeClassrooms || 0) },
      ],
    },
    {
      title: 'Учителя',
      value: stats?.activeTeachers || 0,
      icon: '👨‍🏫',
      color: 'orange',
      details: [
        { label: 'Всего пользователей', value: stats?.totalUsers || 0 },
      ],
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className={`stat-card ${card.color}`}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.title}</div>
            {card.details && card.details.length > 0 && (
              <div className="stat-details">
                {card.details.map((detail, idx) => (
                  <span key={idx}>
                    {detail.label}: {detail.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;