interface RoleDistributionChartProps {
  students: number;
  teachers: number;
  total: number;
}

const RoleDistributionChart = ({ students, teachers, total }: RoleDistributionChartProps) => {
  const admins = total - students - teachers;
  
  // Вычисляем проценты
  const studentsPercent = total > 0 ? (students / total) * 100 : 0;
  const teachersPercent = total > 0 ? (teachers / total) * 100 : 0;
  const adminsPercent = total > 0 ? (admins / total) * 100 : 0;
  
  // Для SVG круговой диаграммы
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // Смещения для сегментов
  const studentsOffset = 0;
  const teachersOffset = (studentsPercent / 100) * circumference;
  const adminsOffset = teachersOffset + (teachersPercent / 100) * circumference;
  
  const studentsStroke = (studentsPercent / 100) * circumference;
  const teachersStroke = (teachersPercent / 100) * circumference;
  const adminsStroke = (adminsPercent / 100) * circumference;

  return (
    <div className="role-chart-container">
      <svg className="role-chart" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="40"
        />
        
        {/* Students segment */}
        {students > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#764ba2"
            strokeWidth="40"
            strokeDasharray={`${studentsStroke} ${circumference}`}
            strokeDashoffset={-studentsOffset}
            transform="rotate(-90 100 100)"
          />
        )}
        
        {/* Teachers segment */}
        {teachers > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#667eea"
            strokeWidth="40"
            strokeDasharray={`${teachersStroke} ${circumference}`}
            strokeDashoffset={-teachersOffset}
            transform="rotate(-90 100 100)"
          />
        )}
        
        {/* Admins segment */}
        {admins > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f093fb"
            strokeWidth="40"
            strokeDasharray={`${adminsStroke} ${circumference}`}
            strokeDashoffset={-adminsOffset}
            transform="rotate(-90 100 100)"
          />
        )}
        
        {/* Center text */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fontSize="32"
          fontWeight="700"
          fill="#333"
        >
          {total}
        </text>
        <text
          x="100"
          y="115"
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          всего
        </text>
      </svg>
      
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color students"></span>
          <span className="legend-label">Студенты</span>
          <span className="legend-value">{students} ({studentsPercent.toFixed(0)}%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color teachers"></span>
          <span className="legend-label">Учителя</span>
          <span className="legend-value">{teachers} ({teachersPercent.toFixed(0)}%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color admins"></span>
          <span className="legend-label">Админы</span>
          <span className="legend-value">{admins} ({adminsPercent.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default RoleDistributionChart;