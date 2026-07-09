import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";

export function AppLayout() {
  const { theme } = useThemeStore();
  const location = useLocation();
  const isSemiDark = theme === 'semi-dark';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary-500 selection:text-brand-on-accent transition-colors duration-300">
      <Sidebar className={isSemiDark ? "dark" : ""} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <Header className={isSemiDark ? "dark" : ""} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300">
          <div key={location.pathname} className="animate-page-enter w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
