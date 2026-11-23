import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-card flex items-center gap-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary-300 hover:shadow-elevated hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-0.5">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
};
