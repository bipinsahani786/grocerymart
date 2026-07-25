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
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/30 dark:bg-slate-900/10 relative">
          
          {/* Bottom Background Wave Pattern */}
          <div className="fixed bottom-0 left-0 right-0 w-full pointer-events-none z-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
              <path fill="currentColor" className="text-primary-200 dark:text-primary-600 opacity-40 dark:opacity-20 transition-colors duration-500" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,197.3C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              <path fill="currentColor" className="text-primary-300 dark:text-primary-500 opacity-40 dark:opacity-15 transition-colors duration-500" d="M0,256L48,234.7C96,213,192,171,288,170.7C384,171,480,213,576,213.3C672,213,768,171,864,165.3C960,160,1056,192,1152,213.3C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              <path fill="currentColor" className="text-primary-400 dark:text-primary-400 opacity-30 dark:opacity-10 transition-colors duration-500" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          <div key={location.pathname} className="p-0 animate-page-fade relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
