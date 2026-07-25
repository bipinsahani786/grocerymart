import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";

export function AppLayout() {
  const { theme } = useThemeStore();
  const location = useLocation();
  const isSemiDark = theme === 'semi-dark';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary-500 selection:text-brand-on-accent transition-colors">
      <Sidebar className={isSemiDark ? "dark" : ""} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header className={isSemiDark ? "dark" : ""} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/30 dark:bg-slate-900/10">
          <div key={location.pathname} className="p-0 animate-page-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
