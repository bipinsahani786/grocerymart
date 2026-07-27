import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { theme } = useThemeStore();
  const location = useLocation();
  const isSemiDark = theme === 'semi-dark';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary-500 selection:text-brand-on-accent transition-colors">
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
