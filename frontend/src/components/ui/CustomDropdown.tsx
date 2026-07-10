import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select Option",
  className,
  triggerClassName
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full z-30", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-left shadow-sm cursor-pointer select-none font-semibold",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-full min-w-[140px] rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto select-none">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-8 text-xs outline-none hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500/20 dark:hover:text-primary-400 transition-colors text-left font-semibold",
                opt.value === value && "bg-muted text-primary-500 font-extrabold"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                {opt.icon}
                {opt.label}
              </span>
              {opt.value === value && (
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-500" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
