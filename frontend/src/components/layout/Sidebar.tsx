import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Users, 
  UserPlus, 
  Building2, 
  ClipboardList,
  Package,
  Wallet,
  FileStack
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { ShieldAlert, Settings, Database, Briefcase, Coins, UserCircle, LogOut, MessageSquare } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

const businessMenuGroups = [
  {
    title: "MAIN",
    items: [
      { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    ]
  }
];

const superadminMenuGroups = [
  {
    title: "GLOBAL",
    items: [
      { name: "DASHBOARD", href: "/superadmin/dashboard", icon: ShieldAlert, permission: "view_dashboard" },
    ]
  }
];

function PortalTooltip({ text, children, visible }: { text: string, children: React.ReactElement, visible: boolean }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLElement>(null);

  const handleMouseEnter = (e: any) => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
      setShow(true);
    }
    if ((children.props as any).onMouseEnter) (children.props as any).onMouseEnter(e);
  };

  const handleMouseLeave = (e: any) => {
    setShow(false);
    if ((children.props as any).onMouseLeave) (children.props as any).onMouseLeave(e);
  };

  const child = React.cloneElement(children as React.ReactElement<any>, {
    ref,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {child}
      {show && visible && createPortal(
        <div 
          className="fixed z-[9999] px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm -translate-y-1/2 shadow-xl shadow-primary-500/30 flex items-center whitespace-nowrap border border-white/20 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rotate-45 rounded-sm border-l border-b border-white/20"></div>
          {text}
        </div>,
        document.body
      )}
    </>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayoutStore();
  const user = useAuthStore((state) => state.user);
  const { appName, appLogo } = useAppStore();
  const { hasPermission } = usePermissions();

  const isSuperadmin = user?.userType === 'admin';
  
  const filteredSuperadminGroups = superadminMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const activeMenuGroups = isSuperadmin 
    ? filteredSuperadminGroups 
    : businessMenuGroups;

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/50 z-40 lg:hidden animate-in fade-in"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 h-screen bg-card border-r border-border flex-col shadow-2xl lg:shadow-sm z-50 shrink-0 transition-all duration-300 ease-in-out flex",
        isSidebarCollapsed ? "w-[260px] lg:w-[80px] -translate-x-full lg:translate-x-0" : "w-[260px] translate-x-0",
        className
      )}>
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 shrink-0 overflow-hidden">
        <div className="flex items-center">
          {appLogo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mx-auto flex items-center justify-center bg-transparent">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="bg-primary-500 p-1.5 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-white shrink-0 mx-auto">
              {appName ? appName.charAt(0).toUpperCase() : 'B'}
            </div>
          )}
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white uppercase font-display whitespace-nowrap ml-3">
              {appName}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 space-y-8">
        {activeMenuGroups.map((group, idx) => (
          <div key={idx} className="px-2">
            {!isSidebarCollapsed && (
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.15em] mb-2.5 px-4 whitespace-nowrap transition-opacity duration-300">
                {group.title}
              </h4>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || (item.href === '/superadmin/dashboard' && location.pathname === '/superadmin') || (item.href === '/dashboard' && location.pathname === '/');
                return (
                  <PortalTooltip key={item.name} text={item.name} visible={isSidebarCollapsed}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center text-[12px] font-medium tracking-[0.05em] transition-all duration-300 group relative",
                        isSidebarCollapsed ? "px-0 justify-center w-11 h-11 mx-auto rounded-sm" : "py-2.5 px-4 rounded-sm mx-2",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <item.icon
                        strokeWidth={isActive ? 2 : 1.5}
                        className={cn(
                          "flex-shrink-0 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                          isSidebarCollapsed ? "mx-auto" : "mr-3.5",
                          isActive ? "text-primary-600 dark:text-primary-500" : "text-slate-600 dark:text-slate-400 group-hover:text-primary-500"
                        )}
                      />
                      {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                  </PortalTooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0">
        <PortalTooltip text="LOG OUT" visible={isSidebarCollapsed}>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
            }}
            className={cn(
              "flex items-center w-full text-[12px] font-medium tracking-[0.05em] transition-all duration-300 group relative text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10",
              isSidebarCollapsed ? "px-0 justify-center h-11 rounded-sm" : "py-2.5 px-4 rounded-sm"
            )}
          >
            <LogOut
              strokeWidth={1.5}
              className={cn(
                "flex-shrink-0 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                isSidebarCollapsed ? "mx-auto" : "mr-3.5"
              )}
            />
            {!isSidebarCollapsed && <span className="whitespace-nowrap">LOG OUT</span>}
          </button>
        </PortalTooltip>
      </div>
    </div>
    </>
  );
}
