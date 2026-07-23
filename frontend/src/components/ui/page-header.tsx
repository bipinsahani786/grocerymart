import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
  onBack,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5 px-6 py-2.5 flex items-center justify-between gap-2 transition-colors min-h-[52px] mb-5',
        className
      )}
    >
      {/* Left side: Title, Divider, Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-[15px] font-bold text-slate-800 dark:text-white truncate leading-tight tracking-tight">{title}</h1>
        
        {breadcrumb && breadcrumb.length > 0 && (
          <>
            <div className="w-[1px] h-4 bg-slate-300 dark:bg-zinc-700 shrink-0" />
            <div className="flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="mx-2 text-slate-300 dark:text-slate-600 text-[10px]">&gt;</span>}
                  <span className={idx === breadcrumb.length - 1 ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors'}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {subtitle && !breadcrumb && (
          <>
            <div className="w-[1px] h-5 bg-slate-200 dark:bg-zinc-700 shrink-0" />
            <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
          </>
        )}
      </div>

      {/* Right side: Actions */}
      {actions && (
        <div className="flex items-center gap-3 shrink-0 mt-3 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
