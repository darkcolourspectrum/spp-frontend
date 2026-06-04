import { useMemo } from 'react';
import type { DailyPoint } from '@/api/admin/analytics';

interface TrendSeries {
  name: string;
  color: string;
  points: DailyPoint[];
}

interface TrendChartProps {
  series: TrendSeries[];
}

// Геометрия области графика (координаты viewBox).
const WIDTH = 720;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 32 };
const PLOT_W = WIDTH - PADDING.left - PADDING.right;
const PLOT_H = HEIGHT - PADDING.top - PADDING.bottom;

/**
 * Линейный график динамики по дням. Самописный SVG (без сторонних
 * библиотек графиков - в проекте графики рисуются вручную, ср.
 * RoleDistributionChart).
 *
 * Поддерживает несколько серий (например, "новые лиды" и "конверсии")
 * с общей осью X (даты) и общей осью Y (количество). Все серии
 * предполагаются выровненными по дням (бэк отдаёт непрерывные ряды,
 * заполненные нулями), поэтому ось X берём из первой серии.
 */
const TrendChart = ({ series }: TrendChartProps) => {
  const { paths, maxY, labels, dotsBySeries, hasData } = useMemo(() => {
    const base = series[0]?.points ?? [];
    const n = base.length;

    // Максимум по Y среди всех серий (минимум 1, чтобы не делить на ноль).
    const allCounts = series.flatMap((s) => s.points.map((p) => p.count));
    const computedMax = Math.max(...allCounts, 0);
    const yMax = computedMax > 0 ? computedMax : 1;

    const xFor = (i: number): number =>
      n <= 1 ? PADDING.left : PADDING.left + (i / (n - 1)) * PLOT_W;
    const yFor = (value: number): number =>
      PADDING.top + PLOT_H - (value / yMax) * PLOT_H;

    // Path и точки для каждой серии.
    const builtPaths = series.map((s) => {
      const d = s.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.count)}`)
        .join(' ');
      return { color: s.color, d };
    });

    const builtDots = series.map((s) => ({
      color: s.color,
      dots: s.points.map((p, i) => ({ cx: xFor(i), cy: yFor(p.count) })),
    }));

    // Подписи оси X: показываем максимум ~6 равномерных дат, чтобы не
    // громоздить. Формат "ДД.ММ".
    const maxLabels = 6;
    const step = n > maxLabels ? Math.ceil(n / maxLabels) : 1;
    const builtLabels: { x: number; text: string }[] = [];
    base.forEach((p, i) => {
      if (i % step === 0 || i === n - 1) {
        const dt = new Date(p.day);
        const text = `${String(dt.getDate()).padStart(2, '0')}.${String(
          dt.getMonth() + 1,
        ).padStart(2, '0')}`;
        builtLabels.push({ x: xFor(i), text });
      }
    });

    return {
      paths: builtPaths,
      maxY: yMax,
      labels: builtLabels,
      dotsBySeries: builtDots,
      hasData: computedMax > 0,
    };
  }, [series]);

  // Горизонтальные линии сетки (0, середина, максимум).
  const gridValues = [0, Math.round(maxY / 2), maxY];
  const yFor = (value: number): number =>
    PADDING.top + PLOT_H - (value / maxY) * PLOT_H;

  if (!hasData) {
    return (
      <div className="trend-empty">
        <p>Нет данных за выбранный период</p>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="trend-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Горизонтальная сетка + подписи оси Y */}
        {gridValues.map((value, idx) => (
          <g key={`grid-${idx}`}>
            <line
              x1={PADDING.left}
              y1={yFor(value)}
              x2={WIDTH - PADDING.right}
              y2={yFor(value)}
              stroke="#eef0f4"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={yFor(value) + 4}
              textAnchor="end"
              fontSize={11}
              fill="#999"
            >
              {value}
            </text>
          </g>
        ))}

        {/* Подписи оси X (даты) */}
        {labels.map((l, idx) => (
          <text
            key={`xlabel-${idx}`}
            x={l.x}
            y={HEIGHT - 10}
            textAnchor="middle"
            fontSize={11}
            fill="#999"
          >
            {l.text}
          </text>
        ))}

        {/* Линии серий */}
        {paths.map((p, idx) => (
          <path
            key={`path-${idx}`}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Точки серий */}
        {dotsBySeries.map((s, sIdx) =>
          s.dots.map((dot, dIdx) => (
            <circle
              key={`dot-${sIdx}-${dIdx}`}
              cx={dot.cx}
              cy={dot.cy}
              r={2.5}
              fill={s.color}
            />
          )),
        )}
      </svg>

      {/* Легенда */}
      <div className="trend-legend">
        {series.map((s) => (
          <div key={s.name} className="trend-legend-item">
            <span
              className="trend-legend-color"
              style={{ backgroundColor: s.color }}
            />
            <span className="trend-legend-label">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;