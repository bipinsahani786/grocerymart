import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  creatable?: boolean;
  onCreate?: (inputValue: string) => void | Promise<void>;
}

export function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select Option",
  searchable = false,
  className,
  triggerClassName,
  menuClassName,
  disabled = false,
  creatable = false,
  onCreate,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options by search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchTerm]);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!onCreate || !searchTerm.trim()) return;
    try {
      setIsCreating(true);
      await onCreate(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("relative w-full z-40 select-none", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-[11px] font-medium tracking-widest text-slate-700 dark:text-zinc-300 uppercase shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer text-left",
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute left-0 right-auto z-[100] mt-1 max-h-60 min-w-full overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl flex flex-col animate-in fade-in-50 slide-in-from-top-1 duration-100",
          menuClassName || "min-w-[150px]"
        )}>
          {(searchable || creatable) && (
            <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1.5 shrink-0">
              <Search className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (creatable && searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase())) {
                      handleCreate();
                    } else if (filteredOptions.length > 0) {
                      onChange(filteredOptions[0].value);
                      setIsOpen(false);
                    }
                  }
                }}
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-48 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center justify-between rounded-none px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors text-left uppercase",
                      isSelected
                        ? "bg-primary-500 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No options found
              </div>
            )}

            {creatable && searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase()) && (
              <button
                type="button"
                disabled={isCreating}
                onClick={handleCreate}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-left font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 border-t border-slate-100 dark:border-zinc-800 uppercase"
              >
                <span className="truncate">
                  {isCreating ? `Creating "${searchTerm}"...` : `Create "${searchTerm}"`}
                </span>
                <Plus className={cn("h-3.5 w-3.5 shrink-0 ml-2", isCreating && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
