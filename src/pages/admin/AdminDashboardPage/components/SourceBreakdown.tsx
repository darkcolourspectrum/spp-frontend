import type { SourceBreakdownItem } from '@/api/admin/analytics';

interface SourceBreakdownProps {
  items: SourceBreakdownItem[];
}

/** Человекочитаемые подписи источников лидов (зеркало CRM LeadSource). */
const SOURCE_LABELS: Record<string, string> = {
  landing: 'Лендинг',
  instagram: 'Instagram',
  referral: 'Рекомендации',
  manual: 'Вручную',
  unknown: 'Не указан',
};

/**
 * Разбивка лидов по источникам с конверсией каждого источника.
 * Помогает понять, какой канал привлечения приносит не просто больше
 * лидов, а больше клиентов. Отсортировано бэком по убыванию total.
 */
const SourceBreakdown = ({ items }: SourceBreakdownProps) => {
  if (items.length === 0) {
    return (
      <div className="source-empty">
        <p>Нет данных по источникам</p>
      </div>
    );
  }

  const formatPercent = (rate: number): string => `${(rate * 100).toFixed(0)}%`;

  return (
    <div className="source-table">
      <div className="source-table-head">
        <span className="source-col-name">Источник</span>
        <span className="source-col-num">Лидов</span>
        <span className="source-col-num">Клиентов</span>
        <span className="source-col-num">Конверсия</span>
      </div>
      {items.map((item) => {
        const label = SOURCE_LABELS[item.source] ?? item.source;
        // Подсветка конверсии: зелёная при высокой, серая при нулевой.
        const rateClass =
          item.conversion_rate >= 0.3
            ? 'rate-high'
            : item.conversion_rate > 0
              ? 'rate-mid'
              : 'rate-zero';
        return (
          <div key={item.source} className="source-table-row">
            <span className="source-col-name">{label}</span>
            <span className="source-col-num">{item.total}</span>
            <span className="source-col-num">{item.converted}</span>
            <span className={`source-col-num source-rate ${rateClass}`}>
              {formatPercent(item.conversion_rate)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SourceBreakdown;