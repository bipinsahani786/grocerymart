import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Store,
  UserCog,
  ShoppingCart,
  ClipboardCheck,
  Package,
  Boxes,
  FileText,
  Users,
  TrendingUp,
  Layers,
  Tv,
  Settings,
  Search,
  ShieldAlert,
  FolderTree,
  ShoppingBag,
  Percent,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useThemeStore } from "@/store/themeStore";
import { usePermissions } from "@/hooks/usePermissions";

export function isRouteActive(itemHref: string, pathname: string) {
  if (pathname === itemHref || pathname.startsWith(itemHref + '/')) {
    return true;
  }
  return (
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
        name: "Dashboard",
        href: "/store/dashboard",
        icon: LayoutDashboard,
        subtitle: "Daily store operations, orders, catalog and revenue",
      },
      {
        name: "Orders",
        href: "/store/orders",
        icon: ClipboardCheck,
        subtitle: "Accept, pack and track POS, delivery and online store orders",
      },
      {
        name: "Point of Sale",
        href: "/store/pos",
        icon: ShoppingCart,
        subtitle: "Barcode, manual entry and customer billing terminal",
      },
      {
        name: "Pickup Board",
        href: "/store/pickup",
        icon: Tv,
        subtitle: "Click & Collect orders TV display mode",
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      {
        name: "Categories",
        href: "/store/categories",
        icon: Layers,
        subtitle: "Group and sort items into nested hierarchy trees",
      },
      {
        name: "Inventory",
        href: "/store/inventory",
        icon: Boxes,
        subtitle: "Stock levels, batch tracking, purchase orders and audits",
      },
      {
        name: "Purchases & Inward",
        href: "/store/purchases",
        icon: ShoppingBag,
        subtitle: "Inward purchase bills, suppliers, and frozen tax batches",
      },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      {
        name: "Customers",
        href: "/store/customers",
        icon: Users,
        subtitle: "Customer profiles, loyalty points and credit tracking",
      },
      {
        name: "Staff",
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
        name: "Billing",
        href: "/store/billing",
        icon: FileText,
        subtitle: "Thermal receipts, GST invoices, reprints, refunds and cash reconciliation",
      },
      {
        name: "Analytics",
        href: "/store/analytics",
        icon: TrendingUp,
        subtitle: "Sales, products, payment methods, staff KPIs and hourly load",
      },
    ],
  },
  {
    title: "PROMOTIONS",
    items: [
      {
        name: "Offers & Club",
        href: "/store/offers",
        icon: Percent,
        subtitle: "Coupons, flat/percentage discount rules, and VIP subscription plans",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Settings",
        href: "/store/settings",
        icon: Settings,
        subtitle: "Store hours, order types enable/disable, tax config, and POS settings",
      },
    ],
  },
];

export const superadminMenuGroups = [
  {
    title: "GLOBAL",
    items: [
      {
        name: "Dashboard",
        href: "/superadmin/dashboard",
        icon: ShieldAlert,
        permission: "view_dashboard",
        subtitle: "Global analytics, revenues, and partner commission tracking",
      },
      {
        name: "Tax Management",
        href: "/superadmin/taxes",
        icon: FileText,
        permission: "view_dashboard",
        subtitle: "Manage dynamic tax rules and HSN tax classes",
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      {
        name: "Master Categories",
        href: "/superadmin/catalog/categories",
        icon: FolderTree,
        permission: "view_dashboard",
        subtitle: "Global category tree for the platform",
      },
      {
        name: "Master Products",
        href: "/superadmin/catalog/products",
        icon: Package,
        permission: "view_dashboard",
        subtitle: "Global products available for store import",
      },
    ],
  },
  {
    title: "STORE",
    items: [
      {
        name: "Store Dashboard",
        href: "/stores",
        icon: Store,
        permission: "view_dashboard",
        subtitle: "Create, view and update settings for all franchise retail locations",
      },
      {
        name: "Store Managers",
        href: "/store-managers",
        icon: UserCog,
        permission: "view_dashboard",
        subtitle: "View, add, edit and suspend store manager access profiles",
      },
    ],
  },
];

/* ── Tooltip for collapsed sidebar styled dynamically to active theme color ── */
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
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
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
            className="fixed z-[9999] px-3 py-1.5 bg-primary-600 dark:bg-primary-500 text-white text-xs font-semibold rounded-md -translate-y-1/2 shadow-lg shadow-primary-500/25 pointer-events-none whitespace-nowrap flex items-center border border-white/20 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 dark:bg-primary-500 rotate-45" />
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
          className={cn("fixed inset-0 bg-black/30 z-40 lg:hidden", isDark && "dark")}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 h-screen flex-col z-50 shrink-0 transition-all duration-200 ease-out flex border-r border-border bg-card text-card-foreground shadow-sm",
          isSidebarCollapsed
            ? "w-[190px] lg:w-[56px] -translate-x-full lg:translate-x-0"
            : "w-[190px] translate-x-0",
          className,
        )}
      >
        {/* ── Brand ── */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-border shrink-0 overflow-hidden",
            isSidebarCollapsed ? "justify-center px-0" : "px-3.5"
          )}
        >
          <div className={cn("flex items-center gap-2.5 min-w-0", isSidebarCollapsed && "justify-center")}>
            {appLogo ? (
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                <img src={appLogo} alt={appName} className="w-full h-full object-contain dark:invert" />
              </div>
            ) : (
              <div className="bg-primary-600 rounded-lg w-9 h-9 flex items-center justify-center text-white text-sm font-extrabold shrink-0 shadow-xs">
                {appName ? appName.charAt(0).toUpperCase() : "G"}
              </div>
            )}
            {!isSidebarCollapsed && (
              <span className="text-[17px] font-extrabold tracking-tight truncate text-primary-600 dark:text-primary-400">
                {appName}
              </span>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        {!isSidebarCollapsed && (
          <div className="px-3 py-2 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full h-7 pl-8 pr-2 text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-colors border border-border font-semibold bg-muted/40 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pt-1 pb-8 space-y-1">
          {filteredMenuGroups.map((group, idx) => (
            <div key={idx}>
              {idx > 0 && !isSidebarCollapsed && (
                <div className="mx-3 my-1 border-t border-border/60" />
              )}
              {!isSidebarCollapsed && (
                <div className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-wider uppercase select-none text-muted-foreground">
                  {group.title}
                </div>
              )}
              <div className={cn("space-y-[1px]", isSidebarCollapsed ? "px-0" : "px-2")}>
                {group.items.map((item) => {
                  const isActive = isRouteActive(item.href, location.pathname);
                  return (
                    <PortalTooltip key={item.name} text={item.name} visible={isSidebarCollapsed}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center text-[13px] font-medium transition-colors duration-150 relative rounded-md",
                          isSidebarCollapsed
                            ? "justify-center w-9 h-9 mx-auto"
                            : "h-8 px-2.5 gap-2.5",
                          isActive
                            ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {isActive && !isSidebarCollapsed && (
                          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-primary-500" />
                        )}
                        <item.icon
                           strokeWidth={isActive ? 2 : 1.5}
                           className={cn(
                             "shrink-0 h-4 w-4",
                             isActive
                               ? "text-primary-600 dark:text-primary-400"
                               : "text-muted-foreground"
                           )}
                        />
                        {!isSidebarCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </PortalTooltip>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="h-8 shrink-0" />
        </nav>
      </div>
    </>
  );
}
