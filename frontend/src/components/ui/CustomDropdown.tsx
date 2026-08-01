import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X, Plus } from 'lucide-react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 180 });

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

  // Recalculate portal position and prevent right screen clipping
  useEffect(() => {
    if (!isOpen) return;
    const updateCoords = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = Math.max(180, rect.width);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let calculatedLeft = rect.left;
        if (calculatedLeft + menuWidth > viewportWidth - 16) {
          calculatedLeft = Math.max(16, viewportWidth - menuWidth - 16);
        }

        let calculatedTop = rect.bottom;
        if (rect.bottom + 220 > viewportHeight && rect.top > 220) {
          calculatedTop = Math.max(8, rect.top - 220);
        }

        setCoords({
          top: calculatedTop,
          left: calculatedLeft,
          width: menuWidth,
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleCreate = async () => {
    if (!onCreate || !searchTerm.trim()) return;
    const termToCreate = searchTerm.trim();
    setSearchTerm('');
    setIsOpen(false);
    await onCreate(termToCreate);
  };

  return (
    <div className={cn("relative w-full text-xs select-none", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer text-left",
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
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ml-1",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* PORTAL DROPDOWN MENU - NEVER CUT OFF BY PARENT CONTAINERS */}
      {isOpen && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-2xs sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile Bottom Sheet Modal (Phone Screens) */}
          <div className="fixed inset-x-0 bottom-0 z-[9999] sm:hidden bg-white dark:bg-zinc-950 rounded-t-2xl border-t border-slate-200 dark:border-zinc-800 p-4 shadow-2xl space-y-3 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">{placeholder}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(searchable || creatable) && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && creatable) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Search..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs border-none outline-none font-medium"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {creatable && searchTerm.trim() && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex w-full items-center gap-2 p-2.5 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-dashed border-primary-500/40 transition-colors text-left"
                >
                  <Plus className="h-4 w-4 shrink-0 text-primary-500" />
                  <span className="truncate">Create New Customer "{searchTerm.trim()}"</span>
                </button>
              )}

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
                        "flex w-full items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors text-left",
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {opt.icon}
                        {opt.label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                    </button>
                  );
                })
              ) : !creatable || !searchTerm.trim() ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">No options found</div>
              ) : null}
            </div>
          </div>

          {/* Desktop Portal Positioned Menu */}
          <div
            className={cn(
              "cascading-dropdown-portal fixed z-[9999] hidden sm:block animate-in fade-in-50 slide-in-from-top-1 duration-100",
              menuClassName
            )}
            style={{
              top: coords.top + 4,
              left: coords.left,
              width: coords.width,
            }}
          >
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col p-1 space-y-1">
              {(searchable || creatable) && (
                <div className="flex items-center border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1.5 shrink-0 rounded-t-lg">
                  <Search className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && creatable) {
                        e.preventDefault();
                        handleCreate();
                      }
                    }}
                    placeholder="Search customer name or phone..."
                    className="w-full bg-transparent border-0 p-0 focus:outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="overflow-y-auto max-h-52 custom-scrollbar p-0.5 space-y-0.5">
                {creatable && searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-dashed border-primary-500/40 transition-colors text-left"
                  >
                    <Plus className="h-4 w-4 shrink-0 text-primary-500" />
                    <span className="truncate">Create New Customer "{searchTerm.trim()}"</span>
                  </button>
                )}

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
                          "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-left",
                          isSelected
                            ? "bg-primary-500 text-white"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {opt.icon}
                          {opt.label}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })
                ) : !creatable || !searchTerm.trim() ? (
                  <div className="px-3 py-3 text-center text-xs text-slate-400 italic">
                    No options found
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
