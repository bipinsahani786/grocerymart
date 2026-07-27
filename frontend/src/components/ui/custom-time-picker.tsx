import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Generate time slots every 30 minutes
const generateTimeSlots = () => {
  const slots: { label: string; value: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const min of [0, 30]) {
      const hStr = hour.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      const value = `${hStr}:${mStr}`;
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayHStr = displayHour.toString().padStart(2, '0');
      const label = `${displayHStr}:${mStr} ${period}`;
      
      slots.push({ label, value });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  // Format 24-hour value to 12-hour display string
  const formatDisplayTime = (val: string) => {
    if (!val) return '';
    const found = TIME_SLOTS.find(s => s.value === val);
    if (found) return found.label;
    
    const [h, m] = val.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return val;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

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

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      let top = rect.bottom + window.scrollY + 4;
      const left = rect.left + window.scrollX;
      
      if (top + 240 > window.scrollY + window.innerHeight) {
        top = rect.top + window.scrollY - 244;
      }

      setPopupStyle({
        top: `${top}px`,
        left: `${left}px`,
        width: `${Math.max(rect.width, 180)}px`,
      });
    }
  }, [isOpen]);

  const handleSelectTime = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const popoverContent = isOpen ? (
    <div 
      ref={popupRef}
      style={popupStyle}
      className="fixed z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-150 scrollbar-none"
    >
      <div className="space-y-0.5">
        {TIME_SLOTS.map((slot) => {
          const isSelected = slot.value === value;
          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => handleSelectTime(slot.value)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer",
                isSelected
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span>{slot.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-9 flex items-center justify-between px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "border-primary-500 ring-2 ring-primary-500/20"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <Clock className="w-4 h-4 text-primary-500 dark:text-primary-400 shrink-0" />
            <span className={cn("truncate font-medium text-xs", !value && "text-slate-400 dark:text-slate-500")}>
              {value ? formatDisplayTime(value) : placeholder}
            </span>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
        </button>
      </div>
      {isOpen && createPortal(popoverContent, document.body)}
    </>
  );
}
