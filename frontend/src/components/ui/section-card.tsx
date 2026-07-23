import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  icon,
  headerRight,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg', className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            {icon && <span className="[&>svg]:w-4 [&>svg]:h-4 text-slate-400">{icon}</span>}
            {title}
          </h2>
          {headerRight && (
            <span className="text-xs text-slate-400">{headerRight}</span>
          )}
        </div>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </div>
  );
}
