import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'berry' | 'emerald' | 'amber' | 'rose' | 'blue';
  sparklinePoints?: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle = 'vs May 5 – May 11',
  icon,
  trend,
  trendPositive = true,
  accentColor = 'berry',
  sparklinePoints = [20, 24, 18, 30, 25, 38, 32, 45, 42, 50],
}) => {
  const accentStyles = {
    berry: {
      iconBox: 'bg-[#fdf2f8] text-[#8e3a59] border-[#e8d8de]',
      line: '#8e3a59',
      fill: 'rgba(142, 58, 89, 0.08)',
    },
    emerald: {
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      line: '#10b981',
      fill: 'rgba(16, 185, 129, 0.08)',
    },
    amber: {
      iconBox: 'bg-amber-50 text-amber-600 border-amber-100',
      line: '#f59e0b',
      fill: 'rgba(245, 158, 11, 0.08)',
    },
    rose: {
      iconBox: 'bg-rose-50 text-rose-600 border-rose-100',
      line: '#f43f5e',
      fill: 'rgba(244, 63, 94, 0.08)',
    },
    blue: {
      iconBox: 'bg-[#fdf2f8] text-[#a5617a] border-[#e8d8de]',
      line: '#a5617a',
      fill: 'rgba(165, 97, 122, 0.08)',
    },
  }[accentColor] || {
    iconBox: 'bg-[#fdf2f8] text-[#8e3a59] border-[#e8d8de]',
    line: '#8e3a59',
    fill: 'rgba(142, 58, 89, 0.08)',
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
    <div className="relative overflow-hidden rounded-2xl p-5 border border-[#e8d8de] bg-white hover:border-[#8e3a59]/60 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">
            {title}
          </span>
          <div className={`p-2 rounded-xl border ${accentStyles.iconBox}`}>
            {icon}
          </div>
        </div>

        {/* Value & Trend */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
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
