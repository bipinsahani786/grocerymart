import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addDays,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface CustomDateTimePickerProps {
  value: string; // Expected format: "YYYY-MM-DDTHH:mm" or ISO
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDateTimePicker({
  value,
  onChange,
  placeholder = 'Select date & time',
  className,
  disabled = false,
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  // Parse ISO / 24h datetime string into date (YYYY-MM-DD), hour12 (1-12), minute (00, 05, etc.), period (AM/PM)
  const parseValue = (val: string) => {
    let dateStr = '';
    let hour24 = 9;
    let minute = 0;

    if (val) {
      try {
        const d = parseISO(val);
        if (isValid(d)) {
          dateStr = format(d, 'yyyy-MM-dd');
          hour24 = d.getHours();
          minute = d.getMinutes();
        }
      } catch {
        // fallback
      }
      if (!dateStr && val.includes('T')) {
        const [dStr, tStr] = val.split('T');
        dateStr = dStr;
        if (tStr) {
          const parts = tStr.split(':');
          hour24 = parseInt(parts[0], 10) || 9;
          minute = parseInt(parts[1], 10) || 0;
        }
      }
    }

    const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    // Round minute to nearest 5 for clean UI selection
    const roundedMinute = Math.round(minute / 5) * 5 % 60;

    return { dateStr, hour12, minute: roundedMinute, period };
  };

  const initial = parseValue(value);
  const [tempDateStr, setTempDateStr] = useState<string>(initial.dateStr);
  const [selectedHour, setSelectedHour] = useState<number>(initial.hour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initial.period);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (initial.dateStr) {
      const parsed = parseISO(initial.dateStr);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  // Sync state when external value changes
  useEffect(() => {
    const parsed = parseValue(value);
    setTempDateStr(parsed.dateStr);
    setSelectedHour(parsed.hour12);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);

    if (parsed.dateStr) {
      const d = parseISO(parsed.dateStr);
      if (isValid(d)) setCurrentMonth(d);
    }
  }, [value]);

  // Click outside handler
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

  // Fixed Viewport Screen-Clamped Positioning (NEVER hides above screen!)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupHeight = 410; // Popover height
      const popupWidth = 300;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = rect.bottom + 6;

      // If popping down overflows off bottom of screen, try popping up
      if (top + popupHeight > viewportHeight) {
        const topUp = rect.top - popupHeight - 6;
        // Clamp top so it NEVER goes off top of screen (min 12px from top)
        top = Math.max(12, topUp);
      }

      // If top is still overflowing bottom, clamp to bottom margin
      if (top + popupHeight > viewportHeight) {
        top = Math.max(12, viewportHeight - popupHeight - 12);
      }

      // Clamp horizontal left positioning
      let left = rect.left;
      if (left + popupWidth > viewportWidth) {
        left = Math.max(12, viewportWidth - popupWidth - 12);
      }

      setPopupStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Helper to emit combined ISO datetime string
  const emitCombinedValue = (dStr: string, hr12: number, min: number, prd: 'AM' | 'PM') => {
    if (!dStr) return;
    let hr24 = hr12 % 12;
    if (prd === 'PM') hr24 += 12;

    const formattedHr = String(hr24).padStart(2, '0');
    const formattedMin = String(min).padStart(2, '0');
    onChange(`${dStr}T${formattedHr}:${formattedMin}`);
  };

  const selectedDate = tempDateStr ? parseISO(tempDateStr) : null;
  const isSelectedValid = selectedDate && isValid(selectedDate);

  const handlePreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleSelectDate = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    setTempDateStr(dStr);
    emitCombinedValue(dStr, selectedHour, selectedMinute, selectedPeriod);
  };

  const handleHourSelect = (hr: number) => {
    setSelectedHour(hr);
    if (tempDateStr) emitCombinedValue(tempDateStr, hr, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (min: number) => {
    setSelectedMinute(min);
    if (tempDateStr) emitCombinedValue(tempDateStr, selectedHour, min, selectedPeriod);
  };

  const handlePeriodSelect = (prd: 'AM' | 'PM') => {
    setSelectedPeriod(prd);
    if (tempDateStr) emitCombinedValue(tempDateStr, selectedHour, selectedMinute, prd);
  };

  const handlePresetNow = () => {
    const now = new Date();
    const dStr = format(now, 'yyyy-MM-dd');
    const parsed = parseValue(now.toISOString());

    setTempDateStr(dStr);
    setSelectedHour(parsed.hour12);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
    setCurrentMonth(now);

    emitCombinedValue(dStr, parsed.hour12, parsed.minute, parsed.period);
    setIsOpen(false);
  };

  const handlePresetTomorrow = () => {
    const tomorrow = addDays(new Date(), 1);
    const dStr = format(tomorrow, 'yyyy-MM-dd');

    setTempDateStr(dStr);
    setSelectedHour(9);
    setSelectedMinute(0);
    setSelectedPeriod('AM');
    setCurrentMonth(tomorrow);

    emitCombinedValue(dStr, 9, 0, 'AM');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempDateStr('');
    onChange('');
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white select-none">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 mb-1 text-center text-[10px] font-bold text-slate-400 select-none uppercase tracking-wider">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="w-7 h-7 flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs select-none">
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
                  'w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all duration-150 cursor-pointer font-medium',
                  !isCurrentMonth
                    ? 'text-slate-300 dark:text-zinc-600'
                    : 'text-slate-700 dark:text-slate-200',
                  isSelected
                    ? 'bg-primary-500 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800',
                  isTodayDate && !isSelected
                    ? 'border border-primary-500/80 text-primary-600 dark:text-primary-400 font-bold'
                    : ''
                )}
              >
                {format(currentDay, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCustomTimePicker = () => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <div className="p-3 space-y-3">
        {/* AM / PM Segmented Control */}
        <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => handlePeriodSelect('AM')}
            className={cn(
              'flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              selectedPeriod === 'AM'
                ? 'bg-white dark:bg-zinc-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            AM (Morning)
          </button>
          <button
            type="button"
            onClick={() => handlePeriodSelect('PM')}
            className={cn(
              'flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              selectedPeriod === 'PM'
                ? 'bg-white dark:bg-zinc-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            PM (Afternoon/Night)
          </button>
        </div>

        {/* Hours Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hour
          </label>
          <div className="grid grid-cols-6 gap-1">
            {hours.map((hr) => (
              <button
                key={hr}
                type="button"
                onClick={() => handleHourSelect(hr)}
                className={cn(
                  'h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border',
                  selectedHour === hr
                    ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                )}
              >
                {String(hr).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Minutes Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Minute
          </label>
          <div className="grid grid-cols-6 gap-1">
            {minutes.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => handleMinuteSelect(min)}
                className={cn(
                  'h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border',
                  selectedMinute === min
                    ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                )}
              >
                {String(min).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const displayFormatted = () => {
    if (!isSelectedValid) return placeholder;
    try {
      const datePart = format(selectedDate, 'MMM d, yyyy');
      const hrStr = String(selectedHour).padStart(2, '0');
      const minStr = String(selectedMinute).padStart(2, '0');
      return `${datePart} at ${hrStr}:${minStr} ${selectedPeriod}`;
    } catch {
      return placeholder;
    }
  };

  const popoverContent = isOpen ? (
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-[290px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col"
    >
      {/* Top Tab Bar (Calendar vs Time) */}
      <div className="flex items-center border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('date')}
          className={cn(
            'flex-1 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer',
            activeTab === 'date'
              ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-primary-500" />
          <span>Calendar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('time')}
          className={cn(
            'flex-1 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer',
            activeTab === 'time'
              ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Clock className="w-3.5 h-3.5 text-primary-500" />
          <span>
            Time ({String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod})
          </span>
        </button>
      </div>

      {/* Main Tab Body */}
      {activeTab === 'date' ? renderCalendar() : renderCustomTimePicker()}

      {/* Bottom Action Presets & Done */}
      <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePresetNow}
            className="flex-1 py-1 px-2 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer"
          >
            Right Now
          </button>
          <button
            type="button"
            onClick={handlePresetTomorrow}
            className="flex-1 py-1 px-2 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer"
          >
            Tomorrow 9 AM
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-full py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Check className="w-3.5 h-3.5" /> Confirm Selection
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div ref={containerRef} className={cn('relative w-full', className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-left transition-all shadow-xs cursor-pointer',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/50',
            isOpen && 'border-primary-500 ring-2 ring-primary-500/20'
          )}
        >
          <div className="flex items-center gap-2 truncate flex-1">
            <CalendarIcon className="h-4 w-4 text-primary-500 shrink-0" />
            <span
              className={cn(
                'truncate font-semibold',
                !isSelectedValid && 'text-slate-400 dark:text-zinc-500 font-normal'
              )}
            >
              {displayFormatted()}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isSelectedValid && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </div>
            )}
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </button>
      </div>
      {isOpen && createPortal(popoverContent, document.body)}
    </>
  );
}

export default CustomDateTimePicker;
