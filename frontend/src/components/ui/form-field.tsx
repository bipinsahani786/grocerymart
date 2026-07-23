import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({
  label,
  icon,
  error,
  className,
  children,
  required,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        {icon && <span className="text-slate-400 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
