import React from 'react';

export interface CustomKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass?: string;
  iconColorClass?: string;
  className?: string;
}

export function CustomKpiCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'bg-primary-500',
  iconColorClass = 'text-white bg-white/20',
  className = '',
}: CustomKpiCardProps) {
  return (
    <div
      className={`transition-all duration-300 relative overflow-hidden rounded-md shadow-sm hover:shadow-md border border-white/10 p-3 sm:p-4 flex flex-col justify-between min-h-[85px] w-full text-white group ${colorClass} ${className}`}
    >
      {/* Decorative Background Shapes */}
      <div className="absolute right-2 top-2 w-16 h-16 bg-white/20 rotate-45 rounded-xl mix-blend-overlay pointer-events-none group-hover:bg-white/30 transition-all duration-500" />
      <div className="absolute -left-4 bottom-0 w-20 h-20 bg-black/10 rounded-full mix-blend-overlay pointer-events-none group-hover:bg-black/20 transition-all duration-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[2px] border-white/10 rounded-none mix-blend-overlay opacity-30 pointer-events-none rotate-12 scale-150" />

      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80 select-none truncate block">
              {title}
            </span>
            <div className="flex items-baseline min-w-0 mt-0.5">
              <span
                className="text-lg sm:text-xl font-black tracking-tight font-display truncate block w-full text-white drop-shadow-sm"
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
          <div className="mt-auto min-w-0 pt-1.5 border-t border-white/20">
            <span className="text-[8px] sm:text-[9px] font-semibold text-white/70 block truncate" title={subtitle}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomKpiCard;
