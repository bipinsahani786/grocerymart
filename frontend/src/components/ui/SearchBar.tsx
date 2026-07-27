import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  wrapperClassName?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  wrapperClassName,
  ...props
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden h-9 pr-2.5",
        wrapperClassName
      )}
    >
      <div className="h-9 w-9 flex items-center justify-center bg-primary-50 dark:bg-primary-500/10 border-r border-slate-200 dark:border-zinc-800 text-primary-500 dark:text-primary-400 shrink-0">
        <Search className="w-3.5 h-3.5" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent border-0 pl-3 pr-2 focus:outline-none focus:ring-0 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500",
          className
        )}
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
