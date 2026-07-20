import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Store,
  UserCog,
  ShoppingCart,
  ClipboardCheck,
  PackageCheck,
  Package,
  Boxes,
  FileText,
  Users,
  TrendingUp,
  Layers,
  Tv,
  Settings,
  ChevronDown,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useThemeStore } from "@/store/themeStore";
import { ShieldAlert } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

export function isRouteActive(itemHref: string, pathname: string) {
  return (
    pathname === itemHref ||
    (itemHref === "/superadmin/dashboard" &&
      (pathname === "/superadmin" || pathname === "/dashboard")) ||
    (itemHref === "/stores" && pathname === "/superadmin/stores") ||
    (itemHref === "/store-managers" &&
      pathname === "/superadmin/store-managers") ||
    (itemHref === "/store/dashboard" &&
      (pathname === "/dashboard" || pathname === "/store")) ||
    (itemHref === "/dashboard" && pathname === "/")
  );
}

export const businessMenuGroups = [
  {
    title: "OPERATIONS",
    items: [
      {
        name: "DASHBOARD",
        href: "/store/dashboard",
        icon: LayoutDashboard,
        subtitle: "Daily store operations, orders, catalog and revenue",
      },
      {
        name: "LIVE ORDERS",
        href: "/store/orders",
        icon: ClipboardCheck,
        subtitle:
          "Accept, pack and track POS, delivery and online store orders",
      },
      {
        name: "POS",
        href: "/store/pos",
        icon: ShoppingCart,
        subtitle:
          "Touch friendly walk-in billing, cart checkout, discounts and receipt printing",
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      {
        name: "INVENTORY",
        href: "/store/inventory",
        icon: Boxes,
        subtitle:
          "Unified stock, product listing, stock updates, and bulk uploads",
      },
      {
        name: "CATEGORIES",
        href: "/store/categories",
        icon: Layers,
        subtitle: "Manage parent and sub-categories of products",
      },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      {
        name: "CUSTOMERS",
        href: "/store/customers",
        icon: Users,
        subtitle: "Customer profiles, history, and credit/khata ledger",
      },
      {
        name: "STAFF",
        href: "/store/staff",
        icon: UserCog,
        subtitle: "Roles, PIN login, shifts, performance and picker efficiency",
      },
    ],
  },
  {
    title: "FINANCIALS",
    items: [
      {
        name: "BILLING",
        href: "/store/billing",
        icon: FileText,
        subtitle:
          "Thermal receipts, GST invoices, reprints, refunds and cash reconciliation",
      },
      {
        name: "ANALYTICS",
        href: "/store/analytics",
        icon: TrendingUp,
        subtitle:
          "Sales, products, payment methods, staff KPIs and hourly load",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "PICKUP BOARD",
        href: "/store/pickup",
        icon: Tv,
        subtitle: "Click & Collect orders TV display mode",
      },
      {
        name: "SETTINGS",
        href: "/store/settings",
        icon: Settings,
        subtitle:
          "Store hours, order types enable/disable, tax config, and POS settings",
      },
    ],
  },
];

export const superadminMenuGroups = [
  {
    title: "GLOBAL",
    items: [
      {
        name: "DASHBOARD",
        href: "/superadmin/dashboard",
        icon: ShieldAlert,
        permission: "view_dashboard",
        subtitle: "Global analytics, revenues, and partner commission tracking",
      },
    ],
  },
  {
    title: "STORE",
    items: [
      {
        name: "STORE DASHBOARD",
        href: "/stores",
        icon: Store,
        permission: "view_dashboard",
        subtitle: "Create stores and monitor store-level operating status",
      },
      {
        name: "STORE MANAGERS",
        href: "/store-managers",
        icon: UserCog,
        permission: "view_dashboard",
        subtitle: "View, add, edit and suspend store manager access profiles",
      },
    ],
  },
];

function PortalTooltip({
  text,
  children,
  visible,
}: {
  text: string;
  children: React.ReactElement;
  visible: boolean;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLElement>(null);

  const handleMouseEnter = (e: any) => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
      setShow(true);
    }
    if ((children.props as any).onMouseEnter)
      (children.props as any).onMouseEnter(e);
  };

  const handleMouseLeave = (e: any) => {
    setShow(false);
    if ((children.props as any).onMouseLeave)
      (children.props as any).onMouseLeave(e);
  };

  const child = React.cloneElement(children as React.ReactElement<any>, {
    ref,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {child}
      {show &&
        visible &&
        createPortal(
          <div
            className="fixed z-[9999] px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm -translate-y-1/2 shadow-xl shadow-primary-500/30 flex items-center whitespace-nowrap border border-white/20 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rotate-45 rounded-sm border-l border-b border-white/20"></div>
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayoutStore();
  const user = useAuthStore((state) => state.user);
  const { appName, appLogo } = useAppStore();
  const { theme } = useThemeStore();
  const { hasPermission } = usePermissions();

  const isDark = theme === "dark" || theme === "semi-dark";
  const isSuperadmin =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.userType === "admin";

  const filteredSuperadminGroups = React.useMemo(() => {
    return superadminMenuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPermission(item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }, [hasPermission]);

  const activeMenuGroups = isSuperadmin
    ? filteredSuperadminGroups
    : businessMenuGroups;

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    OPERATIONS: true,
    CATALOG: true,
    RESOURCES: true,
    FINANCIALS: true,
    SYSTEM: true,
    GLOBAL: true,
    STORE: true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredMenuGroups = React.useMemo(() => {
    if (!sidebarSearch) return activeMenuGroups;
    const q = sidebarSearch.toLowerCase();
    return activeMenuGroups
      .map((group) => {
        const matchedItems = group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q)),
        );
        return { ...group, items: matchedItems };
      })
      .filter((group) => group.items.length > 0);
  }, [activeMenuGroups, sidebarSearch]);

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className={cn("fixed inset-0 bg-slate-900/50 dark:bg-black/50 z-40 lg:hidden animate-in fade-in", isDark && "dark")}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 h-screen border-r flex-col shadow-2xl lg:shadow-sm z-50 shrink-0 transition-all duration-300 ease-in-out flex",
          isDark ? "dark bg-[#0f172a] border-white/5" : "bg-white border-slate-100",
          isSidebarCollapsed
            ? "w-[200px] lg:w-[64px] -translate-x-full lg:translate-x-0"
            : "w-[200px] translate-x-0",
          className,
        )}
      >
        {/* Brand */}
        <div className={cn("h-14 flex items-center justify-between px-3 border-b shrink-0 overflow-hidden", isDark ? "border-white/5" : "border-slate-100")}>
          <div className="flex items-center">
            {appLogo ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mx-auto flex items-center justify-center bg-transparent">
                <img
                  src={appLogo}
                  alt={appName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="bg-primary-500 p-1.5 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-white shrink-0 mx-auto">
                {appName ? appName.charAt(0).toUpperCase() : "B"}
              </div>
            )}
            {!isSidebarCollapsed && (
              <span className={cn("font-black text-[12px] tracking-tight uppercase font-display whitespace-nowrap ml-2", isDark ? "text-white" : "text-zinc-900")}>
                {appName.split(" ").map((word, idx) => (
                  <span
                    key={idx}
                    className={
                      idx % 2 === 1
                        ? isDark
                          ? "bg-clip-text bg-gradient-to-r from-willow-green to-seagrass text-transparent ml-1"
                          : "bg-clip-text bg-gradient-to-r from-cerulean to-dark-cyan text-transparent ml-1"
                        : isDark ? "text-white" : "text-zinc-900"
                    }
                  >
                    {word}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Searchbar */}
        {!isSidebarCollapsed && (
          <div className={cn("px-3 pt-3 pb-1 border-b shrink-0", isDark ? "border-white/5" : "border-slate-100")}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search sections..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className={cn(
                  "w-full h-8 pl-8 pr-2.5 text-[10px] font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-foreground",
                  isDark ? "bg-[#1e293b] border-white/5" : "bg-slate-50 border-border"
                )}
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-3 space-y-4">
          {filteredMenuGroups.map((group, idx) => {
            const isSectionOpen = sidebarSearch || !!openSections[group.title];
            return (
              <div key={idx} className="px-2">
                {!isSidebarCollapsed ? (
                  <button
                    onClick={() => toggleSection(group.title)}
                    className={cn(
                      "w-full flex items-center justify-between py-1.5 px-3.5 text-[10px] font-bold tracking-[0.15em] transition-colors cursor-pointer uppercase select-none mb-1 text-left",
                      isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-primary-500"
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200 text-muted-foreground",
                        isSectionOpen && "rotate-180",
                      )}
                    />
                  </button>
                ) : null}

                {(isSectionOpen || isSidebarCollapsed) && (
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const isActive = isRouteActive(
                        item.href,
                        location.pathname,
                      );
                      return (
                        <PortalTooltip
                          key={item.name}
                          text={item.name}
                          visible={isSidebarCollapsed}
                        >
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center text-[11px] font-medium tracking-[0.05em] transition-all duration-200 group relative overflow-hidden active:scale-[0.98]",
                              isSidebarCollapsed
                                ? "px-0 justify-center w-10 h-10 mx-auto rounded-xl"
                                : "py-2.5 px-3 rounded-xl mx-2",
                              isActive
                                ? cn("bg-gradient-to-r font-bold border-l", isDark ? "from-primary-500/10 to-transparent text-primary-400 border-primary-500/30" : "from-primary-50/80 to-transparent text-primary-700 border-primary-200")
                                : cn("transition-colors", isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80")
                            )}
                          >
                            {isActive && (
                              <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] shadow-[1px_0_8px_rgba(16,185,129,0.4)] animate-in fade-in duration-300", isDark ? "bg-primary-500" : "bg-primary-600")} />
                            )}
                            <item.icon
                              strokeWidth={isActive ? 2.5 : 1.5}
                              className={cn(
                                "flex-shrink-0 h-[18px] w-[18px] transition-all duration-300",
                                isSidebarCollapsed ? "mx-auto" : "mr-3",
                                isActive
                                  ? cn("scale-110", isDark ? "text-primary-400" : "text-primary-600")
                                  : cn("group-hover:scale-110", isDark ? "text-slate-500 group-hover:text-primary-400" : "text-slate-400 group-hover:text-primary-500")
                              )}
                            />
                            {!isSidebarCollapsed && (
                              <span className={cn(
                                "whitespace-nowrap transition-transform duration-300",
                                isActive ? "translate-x-0.5" : "group-hover:translate-x-1"
                              )}>
                                {item.name}
                              </span>
                            )}
                          </Link>
                        </PortalTooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
