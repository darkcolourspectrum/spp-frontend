import type { FunnelStage } from '@/api/admin/analytics';

interface LeadFunnelProps {
  stages: FunnelStage[];
}

/** Человекочитаемые подписи статусов воронки (зеркало CRM). */
const STATUS_LABELS: Record<string, string> = {
  new: 'Новые',
  contacted: 'В работе',
  trial_scheduled: 'Записаны на пробное',
  trial_attended: 'Посетили пробное',
  converted: 'Стали клиентами',
  lost: 'Потеряны',
};

/** Цвета этапов: тёплый прогресс к зелёному (converted) и серому (lost). */
const STATUS_COLORS: Record<string, string> = {
  new: '#667eea',
  contacted: '#7c8cf0',
  trial_scheduled: '#9b7cf0',
  trial_attended: '#b56ce0',
  converted: '#28a745',
  lost: '#adb5bd',
};

/**
 * Воронка лидов: горизонтальные полосы, ширина пропорциональна числу
 * лидов на этапе. Подписи и цвета берутся по статусу; неизвестные статусы
 * (если CRM добавит новый) отображаются с дефолтным оформлением.
 *
 * Воронка показывает ТЕКУЩЕЕ распределение лидов, пришедших за период,
 * по их актуальному статусу - то есть слепок "где они сейчас".
 */
const LeadFunnel = ({ stages }: LeadFunnelProps) => {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);

  if (totalCount === 0) {
    return (
      <div className="funnel-empty">
        <p>За выбранный период лидов не было</p>
      </div>
    );
  }

  return (
    <div className="funnel-container">
      {stages.map((stage) => {
        const label = STATUS_LABELS[stage.status] ?? stage.status;
        const color = STATUS_COLORS[stage.status] ?? '#667eea';
        const widthPercent = (stage.count / maxCount) * 100;
        const sharePercent =
          totalCount > 0 ? (stage.count / totalCount) * 100 : 0;

        return (
          <div key={stage.status} className="funnel-row">
            <div className="funnel-label">{label}</div>
            <div className="funnel-bar-track">
              <div
                className="funnel-bar-fill"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                }}
              >
                <span className="funnel-bar-count">{stage.count}</span>
              </div>
            </div>
            <div className="funnel-share">{sharePercent.toFixed(0)}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadFunnel;