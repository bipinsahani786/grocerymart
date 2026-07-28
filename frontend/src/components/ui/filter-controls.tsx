import { RotateCcw } from 'lucide-react';
import * as React from 'react';

import { CustomDatePicker } from './custom-date-picker';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface FilterContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FilterContainer({ className, children, ...props }: FilterContainerProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-md p-4 shadow-sm mb-6 flex flex-wrap items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import { SearchBar, type SearchBarProps } from './SearchBar';

export interface FilterSearchProps extends SearchBarProps {}

export function FilterSearch({
  value,
  onChange,
  placeholder,
  className,
  wrapperClassName,
  ...props
}: FilterSearchProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      wrapperClassName={wrapperClassName}
      {...props}
    />
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  searchable?: boolean;
  wrapperClassName?: string;
  className?: string;
}

import { CustomDropdown } from './CustomDropdown';

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options = [],
  searchable = false,
  wrapperClassName,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("w-full sm:w-44 shrink-0 select-none", wrapperClassName)}>
      <CustomDropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchable={searchable}
        triggerClassName={className}
      />
    </div>
  );
}

export interface FilterDateProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wrapperClassName?: string;
}

export function FilterDate({
  label,
  value,
  onChange,
  className,
  wrapperClassName,
  ...props
}: FilterDateProps) {
  return (
    <div
      className={cn(
        "flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all",
        wrapperClassName
      )}
    >
      <span className="h-full px-2.5 flex items-center bg-slate-50 dark:bg-white/5 border-r border-slate-200 dark:border-zinc-800 text-xs font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase select-none">
        {label}
      </span>
      <div className="flex-1 h-full">
        <CustomDatePicker
          value={value}
          onChange={onChange}
          placeholder="Select Date"
          disabled={props.disabled}
          className={cn("h-full", className)}
        />
      </div>
    </div>
  );
}

export interface FilterResetProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onClick'> {
  onClick: () => void;
}

export function FilterReset({ className, onClick, ...props }: FilterResetProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 text-[11px] font-medium tracking-wider uppercase border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-white/5 px-3 rounded-lg text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 shrink-0 ml-auto",
        className
      )}
      {...props}
    >
      <RotateCcw className="w-3.5 h-3.5" />
      RESET
    </Button>
  );
}
