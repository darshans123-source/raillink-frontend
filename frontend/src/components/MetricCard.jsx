import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'default', // 'success', 'warning', 'info', 'default'
}) {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group">
      {/* Top row: Title and Icon / Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {title}
          </span>
        </div>

        {badgeText && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeStyles[badgeType] || badgeStyles.default
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
        )}
      </div>

      {/* Subtitle / context description */}
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
