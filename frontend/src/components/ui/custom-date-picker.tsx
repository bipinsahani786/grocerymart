import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isValid, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);

  // Parse the currently selected date
  const selectedDate = value ? parseISO(value) : null;
  const isSelectedValid = selectedDate && isValid(selectedDate);

  // Sync currentMonth with value when it changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        setCurrentMonth(parsed);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    const nextOpen = !isOpen;
    if (nextOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 8;
      const left = rect.left + window.scrollX;
      
      if (top + 320 > window.scrollY + window.innerHeight) {
        top = rect.top + window.scrollY - 320 - 8;
      }
      setPopupStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    } else {
      setPopupStyle(null);
    }
    setIsOpen(nextOpen);
  };

  useEffect(() => {
    if (!isOpen) {
      setPopupStyle(null);
      return;
    }
    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 8;
        const left = rect.left + window.scrollX;
        
        if (top + 320 > window.scrollY + window.innerHeight) {
          top = rect.top + window.scrollY - 320 - 8;
        }

        setPopupStyle({
          top: `${top}px`,
          left: `${left}px`,
        });
      }
    };

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const handleSelectDate = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="font-semibold text-sm text-slate-900 dark:text-white select-none">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-400 select-none">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="w-8 h-8 flex items-center justify-center">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-sm select-none">
          {daysInterval.map((currentDay) => {
            const isSelected = isSelectedValid && isSameDay(currentDay, selectedDate);
            const isCurrentMonth = isSameMonth(currentDay, monthStart);
            const isTodayDate = isToday(currentDay);

            return (
              <button
                key={currentDay.toISOString()}
                type="button"
                onClick={() => handleSelectDate(currentDay)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200",
                  !isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200",
                  isSelected ? "bg-primary-500 text-white font-bold shadow-md shadow-primary-500/30" : "hover:bg-slate-100 dark:hover:bg-slate-800",
                  isTodayDate && !isSelected ? "border border-primary-500 text-primary-600 dark:text-primary-400 font-bold" : ""
                )}
              >
                {format(currentDay, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const popoverContent = isOpen && popupStyle ? (
    <div 
      ref={popupRef}
      style={popupStyle}
      className="absolute z-[200] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl w-[260px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {renderCalendar()}
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={containerRef}
        className={cn("relative w-full h-full", className)}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "flex w-full h-full items-center justify-between px-2.5 py-1 text-sm text-left transition-all",
            "bg-transparent focus:outline-none focus:ring-0",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-white/5",
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <CalendarIcon className="h-4 w-4 text-slate-400 dark:text-zinc-400 shrink-0" />
            <span className={cn("truncate font-medium", !isSelectedValid && "text-slate-400 dark:text-slate-500")}>
              {isSelectedValid ? format(selectedDate, "MMM d, yyyy") : placeholder}
            </span>
          </div>
          {isSelectedValid && !disabled ? (
            <div 
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200 ml-1 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </div>
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0 ml-1" />
          )}
        </button>
      </div>
      {isOpen && popupStyle && createPortal(popoverContent, document.body)}
    </>
  );
}
