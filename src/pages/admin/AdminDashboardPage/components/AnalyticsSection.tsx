import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAnalytics,
  setAnalyticsPeriod,
} from '@/modules/admin/store';
import type { AnalyticsPreset } from '@/api/admin/analytics';
import LeadFunnel from './LeadFunnel';
import SourceBreakdown from './SourceBreakdown';
import LessonsOverview from './LessonsOverview';
import TrendChart from './TrendChart';

/** Доступные пресеты периода и их подписи. */
const PERIOD_OPTIONS: { value: AnalyticsPreset; label: string }[] = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
];

/**
 * Аналитический блок дашборда: воронка лидов, конверсия, источники,
 * операционка расписания и графики динамики. Данные приходят с бэка
 * уже агрегированными (admin-service /dashboard/analytics).
 *
 * Период (7/30/90) хранится в Redux (analyticsPeriod); смена периода
 * перезапрашивает аналитику. Существующий operational-дашборд этот
 * компонент не трогает - он живёт отдельным потоком данных.
 */
const AnalyticsSection = () => {
  const dispatch = useAppDispatch();
  const { analytics, analyticsPeriod, isLoadingAnalytics } = useAppSelector(
    (state) => state.admin,
  );

  // Первичная загрузка и перезагрузка при смене периода.
  useEffect(() => {
    dispatch(fetchAnalytics(analyticsPeriod));
  }, [dispatch, analyticsPeriod]);

  const handlePeriodChange = (period: AnalyticsPreset) => {
    if (period !== analyticsPeriod) {
      dispatch(setAnalyticsPeriod(period));
    }
  };

  // Форматирование процента из доли [0..1].
  const formatPercent = (rate: number): string =>
    `${(rate * 100).toFixed(1)}%`;

  // Форматирование среднего времени до конверсии.
  const formatTimeToConversion = (hours: number | null): string => {
    if (hours === null) return '—';
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${(hours / 24).toFixed(1)} дн`;
  };

  return (
    <section className="analytics-section">
      {/* Шапка блока с переключателем периода */}
      <div className="analytics-header">
        <div>
          <h2>Аналитика</h2>
          <p className="analytics-subtitle">
            Воронка продаж и операционные показатели
          </p>
        </div>
        <div className="period-switcher">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`period-button ${
                analyticsPeriod === opt.value ? 'active' : ''
              }`}
              onClick={() => handlePeriodChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Предупреждение о неполноте данных (проекция ещё наполняется) */}
      {analytics && !analytics.data_complete && (
        <div className="analytics-notice">
          Данные собираются с момента запуска аналитики. Историю за
          предыдущий период система ещё накапливает.
        </div>
      )}

      {/* Лоадер при первой загрузке */}
      {isLoadingAnalytics && !analytics ? (
        <div className="analytics-loading">
          <div className="small-spinner"></div>
          <p>Загрузка аналитики...</p>
        </div>
      ) : analytics ? (
        <div className={isLoadingAnalytics ? 'analytics-dimmed' : ''}>
          {/* Ключевые метрики конверсии */}
          <div className="analytics-kpi-row">
            <div className="kpi-card">
              <div className="kpi-value">{analytics.leads.total_created}</div>
              <div className="kpi-label">Новых лидов</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{analytics.leads.total_converted}</div>
              <div className="kpi-label">Конверсий</div>
            </div>
            <div className="kpi-card highlight">
              <div className="kpi-value">
                {formatPercent(analytics.leads.overall_conversion_rate)}
              </div>
              <div className="kpi-label">Конверсия</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">
                {formatTimeToConversion(
                  analytics.leads.avg_time_to_conversion_hours,
                )}
              </div>
              <div className="kpi-label">Среднее время до сделки</div>
            </div>
          </div>

          {/* Воронка + источники */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Воронка лидов</h3>
              <LeadFunnel stages={analytics.leads.funnel} />
            </div>
            <div className="analytics-card">
              <h3>Источники и конверсия</h3>
              <SourceBreakdown items={analytics.leads.by_source} />
            </div>
          </div>

          {/* Динамика: новые лиды и конверсии по дням */}
          <div className="analytics-card">
            <h3>Динамика лидов</h3>
            <TrendChart
              series={[
                {
                  name: 'Новые лиды',
                  color: '#667eea',
                  points: analytics.leads.created_daily,
                },
                {
                  name: 'Конверсии',
                  color: '#28a745',
                  points: analytics.leads.conversions_daily,
                },
              ]}
            />
          </div>

          {/* Операционка расписания */}
          <div className="analytics-card">
            <h3>Занятия</h3>
            <LessonsOverview lessons={analytics.lessons} />
          </div>
        </div>
      ) : (
        <div className="analytics-empty">
          <p>Нет данных за выбранный период</p>
        </div>
      )}
    </section>
  );
};

export default AnalyticsSection;