import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'berry';
  sparklinePoints?: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle = 'Real-time telemetry',
  icon,
  trend,
  trendPositive = true,
  accentColor = 'blue',
  sparklinePoints = [20, 24, 18, 30, 25, 38, 32, 45, 42, 50],
}) => {
  const accentStyles = {
    blue: {
      iconBox: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
      line: '#2563EB',
      fill: 'rgba(37, 99, 235, 0.08)',
    },
    purple: {
      iconBox: 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]',
      line: '#7C3AED',
      fill: 'rgba(124, 58, 237, 0.08)',
    },
    green: {
      iconBox: 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]',
      line: '#10B981',
      fill: 'rgba(16, 185, 129, 0.08)',
    },
    orange: {
      iconBox: 'bg-[#FFF7ED] text-[#F59E0B] border-[#FED7AA]',
      line: '#F59E0B',
      fill: 'rgba(245, 158, 11, 0.08)',
    },
    red: {
      iconBox: 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]',
      line: '#EF4444',
      fill: 'rgba(239, 68, 68, 0.08)',
    },
    berry: {
      iconBox: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
      line: '#2563EB',
      fill: 'rgba(37, 99, 235, 0.08)',
    },
  }[accentColor] || {
    iconBox: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    line: '#2563EB',
    fill: 'rgba(37, 99, 235, 0.08)',
  };

  // Generate SVG path for sparkline
  const min = Math.min(...sparklinePoints);
  const max = Math.max(...sparklinePoints);
  const range = max - min || 1;
  const width = 160;
  const height = 32;

  const points = sparklinePoints
    .map((val, idx) => {
      const x = (idx / (sparklinePoints.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-[#E5E7EB] bg-white hover:border-[#2563EB]/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#6B7280] tracking-tight">
            {title}
          </span>
          <div className={`p-2 rounded-xl border ${accentStyles.iconBox}`}>
            {icon}
          </div>
        </div>

        {/* Value & Trend */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-[#111827] tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trendPositive
                  ? 'bg-[#ECFDF5] text-[#10B981]'
                  : 'bg-[#FEF2F2] text-[#EF4444]'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[11px] text-[#9CA3AF] font-medium">{subtitle}</p>
        )}
      </div>

      {/* Sparkline curve */}
      <div className="mt-3 pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-8 overflow-visible"
          preserveAspectRatio="none"
        >
          <polygon points={areaPoints} fill={accentStyles.fill} />
          <polyline
            fill="none"
            stroke={accentStyles.line}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
};
