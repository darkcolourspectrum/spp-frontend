import type { LessonsAnalytics } from '@/api/admin/analytics';

interface LessonsOverviewProps {
  lessons: LessonsAnalytics;
}

/**
 * Операционная сводка по занятиям за период: всего, отмены, переносы,
 * доля отмен, и нагрузка по преподавателям.
 *
 * Намеренно НЕ показываем "загрузку в процентах": система не хранит
 * рабочее время преподавателя, поэтому честная метрика - количество
 * занятий и сколько из них отменено. Перенос отменой не считается -
 * он вынесен отдельным числом.
 */
const LessonsOverview = ({ lessons }: LessonsOverviewProps) => {
  const formatPercent = (rate: number): string => `${(rate * 100).toFixed(1)}%`;

  if (lessons.total === 0) {
    return (
      <div className="lessons-empty">
        <p>За выбранный период занятий не было</p>
      </div>
    );
  }

  return (
    <div className="lessons-overview">
      {/* Сводные числа */}
      <div className="lessons-summary">
        <div className="lessons-stat">
          <div className="lessons-stat-value">{lessons.total}</div>
          <div className="lessons-stat-label">Всего занятий</div>
        </div>
        <div className="lessons-stat">
          <div className="lessons-stat-value">{lessons.cancelled}</div>
          <div className="lessons-stat-label">Отменено</div>
        </div>
        <div className="lessons-stat">
          <div className="lessons-stat-value">
            {formatPercent(lessons.cancellation_rate)}
          </div>
          <div className="lessons-stat-label">Доля отмен</div>
        </div>
        <div className="lessons-stat">
          <div className="lessons-stat-value">{lessons.rescheduled}</div>
          <div className="lessons-stat-label">Переносов</div>
        </div>
      </div>

      {/* Нагрузка преподавателей */}
      {lessons.by_teacher.length > 0 && (
        <div className="teacher-load">
          <h4>Нагрузка преподавателей</h4>
          <div className="teacher-load-list">
            {lessons.by_teacher.map((t) => {
              const conducted = t.total - t.cancelled;
              const maxTotal = Math.max(
                ...lessons.by_teacher.map((x) => x.total),
                1,
              );
              const barWidth = (t.total / maxTotal) * 100;
              return (
                <div key={t.teacher_id} className="teacher-load-row">
                  <div className="teacher-load-name">
                    {t.teacher_name ?? `ID ${t.teacher_id}`}
                  </div>
                  <div className="teacher-load-bar-track">
                    <div
                      className="teacher-load-bar-fill"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="teacher-load-numbers">
                    <span className="teacher-conducted">{conducted}</span>
                    {t.cancelled > 0 && (
                      <span className="teacher-cancelled">
                        −{t.cancelled}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsOverview;