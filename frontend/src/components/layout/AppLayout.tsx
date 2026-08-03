import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SessionTerminationModal } from "./SessionTerminationModal";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export function AppLayout() {
  const { theme } = useThemeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const isSemiDark = theme === 'semi-dark';

  // Real-time session status heartbeat (verifies user & store active status periodically)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionStatus = async () => {
      try {
        await api.get('/auth/profile');
      } catch (error) {
        // Handled automatically by api.ts response interceptor
      }
    };

    // Run immediately on mount or login
    checkSessionStatus();

    // Poll every 15 seconds for real-time logout checks (reduced from 3s to prevent server flood)
    const interval = setInterval(checkSessionStatus, 15000);

    // Re-check when window is focused or tab becomes visible
    const handleFocus = () => checkSessionStatus();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary-500 selection:text-brand-on-accent transition-colors">
      <SessionTerminationModal />
      <div className={cn("h-screen shrink-0 flex flex-col", isSemiDark && "dark")}>
        <Sidebar className={isSemiDark ? "dark" : ""} />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <div className={cn("w-full shrink-0", isSemiDark && "dark")}>
          <Header className={isSemiDark ? "dark" : ""} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/30 dark:bg-slate-900/10 relative">
          <div key={location.pathname} className="p-0 animate-page-fade relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
