import { useEffect, useState } from 'react';
import { getStudioClassrooms } from '@/api/admin';
import type { Studio } from '@/api/admin/types';

interface StudiosChartProps {
  studios: Studio[];
}

interface StudioWithCount extends Studio {
  classroomsCount: number;
}

const StudiosChart = ({ studios }: StudiosChartProps) => {
  const [studiosWithCounts, setStudiosWithCounts] = useState<StudioWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassroomCounts = async () => {
      if (studios.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Загружаем кабинеты для каждой студии
        const studiosData = await Promise.all(
          studios.map(async (studio) => {
            try {
              const classrooms = await getStudioClassrooms(studio.id);
              return {
                ...studio,
                classroomsCount: classrooms.length,
              };
            } catch (error) {
              console.error(`Failed to load classrooms for studio ${studio.id}:`, error);
              return {
                ...studio,
                classroomsCount: 0,
              };
            }
          })
        );

        // Сортируем по количеству кабинетов (больше -> меньше)
        const sorted = studiosData.sort((a, b) => b.classroomsCount - a.classroomsCount);
        setStudiosWithCounts(sorted);
      } catch (error) {
        console.error('Failed to fetch classroom counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroomCounts();
  }, [studios]);

  if (isLoading) {
    return (
      <div className="empty-chart">
        <div className="small-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (studiosWithCounts.length === 0) {
    return (
      <div className="empty-chart">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  // Берем топ-5 студий
  const topStudios = studiosWithCounts.slice(0, 5);
  const maxValue = Math.max(...topStudios.map(s => s.classroomsCount), 1);

  return (
    <div className="studios-chart-container">
      <div className="studios-list">
        {topStudios.map((studio, index) => (
          <div key={studio.id} className="studio-list-item">
            <div className="studio-rank">#{index + 1}</div>
            <div className="studio-info">
              <div className="studio-name">
                {studio.name}
                {!studio.is_active && <span className="inactive-badge">неактивна</span>}
              </div>
              {studio.address && (
                <div className="studio-address-small">{studio.address}</div>
              )}
            </div>
            <div className="studio-count">
              <span className="count-number">{studio.classroomsCount}</span>
              <span className="count-label">
                {studio.classroomsCount === 1 ? 'кабинет' : 
                 studio.classroomsCount < 5 ? 'кабинета' : 'кабинетов'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {studiosWithCounts.length > 5 && (
        <p className="chart-note">
          Показано топ-5 студий по количеству кабинетов
        </p>
      )}
    </div>
  );
};

export default StudiosChart;