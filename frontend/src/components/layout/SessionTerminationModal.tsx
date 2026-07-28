import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AlertTriangle, LogOut, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SessionTerminationModal() {
  const pendingLogoutReason = useAuthStore((state) => state.pendingLogoutReason);
  const logout = useAuthStore((state) => state.logout);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!pendingLogoutReason) {
      setTimeLeft(15);
      return;
    }

    setTimeLeft(15);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          window.location.href = '/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingLogoutReason, logout]);

  if (!pendingLogoutReason) return null;

  const handleImmediateLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const progressPercentage = (timeLeft / 15) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
        
        {/* Header with animated warning icon */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Session Revoked
            </h2>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              Access Restriction Triggered
            </p>
          </div>
        </div>

        {/* Reason Message Box */}
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {pendingLogoutReason}
          </p>
        </div>

        {/* 15-second Countdown Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-red-500 animate-spin" />
              Logging out automatically
            </span>
            <span className="text-red-600 dark:text-red-400 text-sm font-mono">
              {timeLeft}s
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Button
            onClick={handleImmediateLogout}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout Now ({timeLeft}s)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
