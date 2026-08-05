import React from 'react';

export interface CustomKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass?: string;
  iconColorClass?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CustomKpiCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'bg-primary-500',
  iconColorClass = 'text-white bg-white/20',
  className = '',
  onClick,
  isActive,
}: CustomKpiCardProps) {
  const hasTextColor = colorClass.includes('text-');
  const textClass = hasTextColor ? '' : 'text-white';
  const labelTextClass = hasTextColor ? 'text-slate-500 dark:text-zinc-400' : 'text-white/80';
  const valueTextClass = hasTextColor ? 'text-slate-900 dark:text-white' : 'text-white';
  const subtitleTextClass = hasTextColor ? 'text-slate-500 dark:text-zinc-500' : 'text-white/70';
  const borderClass = hasTextColor ? 'border-slate-100 dark:border-zinc-800' : 'border-white/20';

  return (
    <div
      onClick={onClick}
      className={`transition-all duration-300 relative overflow-hidden rounded-md shadow-sm hover:shadow-md border border-slate-200/50 dark:border-zinc-800 p-3 sm:p-4 flex flex-col justify-between min-h-[85px] w-full group ${colorClass} ${textClass} ${className} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${isActive ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-950' : ''}`}
    >
      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider select-none truncate block ${labelTextClass}`}>
              {title}
            </span>
            <div className="flex items-baseline min-w-0 mt-0.5">
              <span
                className={`text-lg sm:text-xl font-black tracking-tight font-display truncate block w-full drop-shadow-sm ${valueTextClass}`}
                title={value.toString()}
              >
                {value}
              </span>
            </div>
          </div>
          <div className={`p-2 rounded flex items-center justify-center shrink-0 transition-colors backdrop-blur-sm shadow-sm ${iconColorClass}`}>
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' })
              : icon}
          </div>
        </div>

        {subtitle && (
          <div className={`mt-auto min-w-0 pt-1.5 border-t ${borderClass}`}>
            <span className={`text-[8px] sm:text-[9px] font-semibold block truncate ${subtitleTextClass}`} title={subtitle}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomKpiCard;
