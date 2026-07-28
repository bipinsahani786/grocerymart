import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  ShoppingCart,
  Store,
  Users,
  AlertTriangle,
  Plus,
  TrendingUp,
  Tv,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useStoreDashboard, useStoreInventory } from "@/features/store/api/useStorePanel";
import { useThemeStore } from "@/store/themeStore";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function StoreManagerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const store = user?.store;
  const { data: dashboardData } = useStoreDashboard(store?.id);
  const { data: inventoryData } = useStoreInventory(store?.id);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const summary = dashboardData?.summary;
  const recentOrders = dashboardData?.recentOrders || [];
  const inventory = inventoryData || [];

  const formattedStoreName = useMemo(() => {
    const rawName = store?.name || "Store Dashboard";
    return rawName
      .replace(/\bsk store\b/gi, "SK Store")
      .replace(/\bsk\b/gi, "SK");
  }, [store]);

  const [chartMetric, setChartMetric] = useState<"revenue" | "volume">(
    "revenue",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [dismissedProductIds, setDismissedProductIds] = useState<string[]>([]);

  // 1. Dashboard summary metrics
  const stats = useMemo(() => {
    const revenue = summary?.revenueToday || 0;
    const ordersCount = summary?.ordersToday || 0;
    const avgBill = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;
    const activeStaff = summary?.staff || 0;
    const lowStockCount = summary?.lowStock || 0;

    return {
      ordersCount,
      revenue,
      avgBill,
      activeStaff,
      lowStockCount,
      slaRate: 98,
    };
  }, [summary]);

  // 2. Chart data builder
  const chartData = useMemo(() => {
    const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    const todayStr = new Date().toISOString().split("T")[0];

    return hours.map((hour) => {
      const hourInt = parseInt(hour.split(":")[0]);
      const matchedOrders = recentOrders.filter((o: any) => {
        if (!o.createdAt?.startsWith(todayStr)) return false;
        if (o.status === "CANCELLED" || o.status === "REFUNDED") return false;
        const orderHour = new Date(o.createdAt).getHours();
        return orderHour >= hourInt - 2 && orderHour < hourInt;
      });

      const sales = matchedOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      return {
        time: hour,
        value: chartMetric === "revenue" ? sales : matchedOrders.length,
      };
    });
  }, [recentOrders, chartMetric]);

  // 3. Highlighted feeds with search and channel filter
  const recentFeed = useMemo(() => {
    let feed = recentOrders;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      feed = feed.filter((o: any) =>
        (o.orderNumber || o.id).toString().toLowerCase().includes(q) ||
        (o.type || "").toLowerCase().includes(q) ||
        (o.status || "").toLowerCase().includes(q)
      );
    }
    if (channelFilter !== "ALL") {
      feed = feed.filter((o: any) => o.type?.toUpperCase() === channelFilter.toUpperCase());
    }
    return feed.slice(0, 5);
  }, [recentOrders, searchQuery, channelFilter]);

  const warningList = useMemo(() => {
    return inventory
      .filter((p: any) => {
        const invQty = p.inventory?.[0]?.quantity ?? 0;
        const alertQty = p.inventory?.[0]?.lowStockAt ?? 10;
        return invQty <= alertQty && !dismissedProductIds.includes(String(p.id));
      })
      .slice(0, 3);
  }, [inventory, dismissedProductIds]);

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setDismissedProductIds(prev => [...prev, String(productToDelete.id)]);
      toast.success(`Low stock warning alert dismissed for "${productToDelete.name}".`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-12 relative overflow-hidden">
      {/* Dynamic glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Local custom animations & glows styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes scale-in {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-slide-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .pulse-indicator::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="w-full max-w-[1500px] mx-auto px-2 lg:px-3 pt-2.5 pb-6 space-y-5">
        {/* Asymmetric Hero welcome banner */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* Main Info Card - Glossy Poster Redesign */}
          <div
            className={`lg:col-span-3 rounded-xl p-5 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 min-h-[145px] opacity-0 animate-scale-in ${isDark
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-white/10 text-white shadow-xl shadow-primary-500/5"
              : "bg-gradient-to-br from-primary-50 via-white to-indigo-50 border-primary-500/20 text-slate-900 shadow-xl shadow-primary-500/5"
              }`}
          >
            {/* Grid Pattern overlay */}
            <div
              className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-[0.4]" : "opacity-[0.25] invert"}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0H0V14' fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
                backgroundSize: '14px 14px'
              }}
            />

            {/* Dynamic Glass Highlight Sheen */}
            <div className="absolute top-0 left-[-40%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />

            {/* Background design glow shapes */}
            <div className={`absolute right-[-10%] top-[-30%] w-[240px] h-[240px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-amber-400/20' : 'bg-amber-400/35'
              }`} />
            <div className={`absolute right-[20%] bottom-[-60%] w-[180px] h-[180px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-rose-500/20' : 'bg-rose-500/30'
              }`} />

            {/* Rotated background sheet decoration */}
            <div
              className={`absolute left-[40%] top-[-35%] w-32 h-32 border rounded-xl rotate-12 pointer-events-none transition-colors ${isDark
                ? "border-white/15 bg-white/[0.05]"
                : "border-primary-500/25 bg-primary-500/[0.05]"
                }`}
            />

            {/* Double outline rings */}
            <div
              className={`absolute right-4 top-4 w-16 h-16 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? "border-white/10" : "border-primary-500/25"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full border transition-colors ${isDark ? "border-white/15" : "border-primary-500/30"}`}
              ></div>
            </div>

            <div className="space-y-0.5 z-10">
              <Badge
                className={`border-none font-black text-[8px] uppercase tracking-widest mb-1.5 px-2 py-0.5 ${isDark
                  ? "bg-white/20 text-white"
                  : "bg-primary-500/10 text-primary-600"
                  }`}
              >
                Operational Terminal
              </Badge>
              <h2
                className={`text-3xl lg:text-4xl font-black font-display tracking-tight flex items-center gap-2 drop-shadow-sm ${isDark
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950"
                  }`}
              >
                <Store className="h-7 w-7 text-amber-300 shrink-0" />
                {formattedStoreName}
              </h2>
              <p
                className={`text-[11px] font-medium ${isDark ? "opacity-85 text-slate-300" : "text-slate-600"}`}
              >
                {store?.address || "Shop No. 12-14, Block C, Sector 62, Noida"}
              </p>
            </div>

            <div
              className={`flex flex-wrap items-center justify-between gap-2.5 pt-3 z-10 border-t mt-3 ${isDark ? "border-white/10" : "border-slate-200"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  className={`h-4 w-4 ${isDark ? "text-emerald-300" : "text-emerald-600"}`}
                />
                <span
                  className={`text-[11px] font-semibold ${isDark ? "text-white" : "text-slate-700"}`}
                >
                  Supervisor: {user?.name || "Bipin Sahani"}
                </span>
              </div>
              <Badge className="bg-emerald-500 text-white font-extrabold text-[8px] px-2.5 py-0.5 tracking-wider uppercase border-none animate-pulse">
                Live Sync Active
              </Badge>
            </div>
          </div>

          {/* Quick command dock */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card/60 backdrop-blur-lg p-6 flex flex-col justify-between shadow-sm opacity-0 animate-scale-in [animation-delay:100ms] relative overflow-hidden">
            {/* Grid Pattern overlay */}
            <div
              className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-[0.35]" : "opacity-[0.15] invert"}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0H0V14' fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
                backgroundSize: '14px 14px'
              }}
            />

            {/* Glass Highlight Sheen */}
            <div className="absolute top-0 left-[-30%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none" />

            {/* Background design glow shapes */}
            <div className={`absolute right-[-15%] top-[-25%] w-[180px] h-[180px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-primary-500/10' : 'bg-primary-500/25'
              }`} />

            {/* Rotated background sheet decoration */}
            <div className={`absolute left-[5%] bottom-[-25%] w-[110px] h-[110px] border-2 rounded-xl rotate-45 pointer-events-none transition-colors ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-primary-500/20 bg-primary-500/[0.05]'
              }`} />

            {/* Double outline rings */}
            <div className={`absolute right-[-20px] bottom-[-20px] w-24 h-24 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? 'border-white/5' : 'border-primary-500/15'
              }`}>
              <div className={`w-16 h-16 rounded-full border transition-colors ${isDark ? 'border-white/10' : 'border-primary-500/20'}`}></div>
            </div>

            <div className="z-10">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                Command Center
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Fast navigation shortcuts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-4 z-10">
              <Link to="/store/pos">
                <Button
                  className="w-full h-11 flex items-center justify-center gap-1.5 text-xs font-bold"
                  variant="brand"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> POS Billing
                </Button>
              </Link>
              <Link to="/store/inventory">
                <Button
                  className="w-full h-11 flex items-center justify-center gap-1.5 text-xs font-bold"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </Link>
              <Link to="/store/orders">
                <Button
                  className="w-full h-11 flex items-center justify-center gap-1.5 text-xs font-bold"
                  variant="outline"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4" /> Orders Queue
                </Button>
              </Link>
              <Link to="/store/pickup">
                <Button
                  className="w-full h-11 flex items-center justify-center gap-1.5 text-xs font-bold"
                  variant="outline"
                  size="sm"
                >
                  <Tv className="h-4 w-4" /> TV Kiosk
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Premium KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Today Sales */}
          <div className="relative group rounded-xl bg-card border border-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500/20 hover:-translate-y-1 opacity-0 animate-fade-slide-up [animation-delay:150ms] overflow-hidden">
            {/* Glass Sheen */}
            <div className="absolute top-0 left-[-30%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none" />
            {/* Glow circle */}
            <div className={`absolute right-[-15%] top-[-25%] w-[140px] h-[140px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-500/30'
              }`} />
            {/* Rotated background card shape */}
            <div className={`absolute left-[-20px] bottom-[-20px] w-20 h-20 border-2 rounded-xl rotate-12 pointer-events-none transition-colors ${isDark ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-emerald-500/25 bg-emerald-500/[0.05]'
              }`} />
            {/* Double outline rings */}
            <div className={`absolute right-[-15px] bottom-[-15px] w-16 h-16 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? 'border-emerald-500/10' : 'border-emerald-500/20'
              }`}>
              <div className={`w-10 h-10 rounded-full border transition-colors ${isDark ? 'border-emerald-500/15' : 'border-emerald-500/25'}`}></div>
            </div>

            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                  Today's Revenue
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="h-10 w-10 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                <BadgeIndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-500 font-extrabold z-10">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+12.4% vs yesterday</span>
            </div>
          </div>

          {/* Card 2: Today Volume */}
          <div className="relative group rounded-xl bg-card border border-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500/20 hover:-translate-y-1 opacity-0 animate-fade-slide-up [animation-delay:200ms] overflow-hidden">
            {/* Glass Sheen */}
            <div className="absolute top-0 left-[-30%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none" />
            {/* Glow circle */}
            <div className={`absolute right-[-15%] top-[-25%] w-[140px] h-[140px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-blue-500/15' : 'bg-blue-500/30'
              }`} />
            {/* Rotated background card shape */}
            <div className={`absolute left-[-20px] bottom-[-20px] w-20 h-20 border-2 rounded-xl rotate-12 pointer-events-none transition-colors ${isDark ? 'border-blue-500/15 bg-blue-500/[0.03]' : 'border-blue-500/25 bg-blue-500/[0.05]'
              }`} />
            {/* Double outline rings */}
            <div className={`absolute right-[-15px] bottom-[-15px] w-16 h-16 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? 'border-blue-500/10' : 'border-blue-500/20'
              }`}>
              <div className={`w-10 h-10 rounded-full border transition-colors ${isDark ? 'border-blue-500/15' : 'border-blue-500/25'}`}></div>
            </div>

            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                  Dispatched Orders
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.ordersCount}
                </h3>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-500 font-bold z-10">
              <Clock className="h-3.5 w-3.5 text-primary-500" />
              <span>UPI, Cash, Credit, splits</span>
            </div>
          </div>

          {/* Card 3: SLA rate */}
          <div className="relative group rounded-xl bg-card border border-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500/20 hover:-translate-y-1 opacity-0 animate-fade-slide-up [animation-delay:250ms] overflow-hidden">
            {/* Glass Sheen */}
            <div className="absolute top-0 left-[-30%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none" />
            {/* Glow circle */}
            <div className={`absolute right-[-15%] top-[-25%] w-[140px] h-[140px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-500/30'
              }`} />
            {/* Rotated background card shape */}
            <div className={`absolute left-[-20px] bottom-[-20px] w-20 h-20 border-2 rounded-xl rotate-12 pointer-events-none transition-colors ${isDark ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-emerald-500/25 bg-emerald-500/[0.05]'
              }`} />
            {/* Double outline rings */}
            <div className={`absolute right-[-15px] bottom-[-15px] w-16 h-16 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? 'border-emerald-500/10' : 'border-emerald-500/20'
              }`}>
              <div className={`w-10 h-10 rounded-full border transition-colors ${isDark ? 'border-emerald-500/15' : 'border-emerald-500/25'}`}></div>
            </div>

            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                  Fulfillment SLA
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.slaRate}%
                </h3>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Mini progress line */}
            <div className="mt-4 space-y-1 z-10">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stats.slaRate}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground font-semibold text-right">
                Pack SLA
              </p>
            </div>
          </div>

          {/* Card 4: Active Team */}
          <div className="relative group rounded-xl bg-card border border-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500/20 hover:-translate-y-1 opacity-0 animate-fade-slide-up [animation-delay:300ms] overflow-hidden">
            {/* Glass Sheen */}
            <div className="absolute top-0 left-[-30%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none" />
            {/* Glow circle */}
            <div className={`absolute right-[-15%] top-[-25%] w-[140px] h-[140px] rounded-full blur-2xl pointer-events-none ${isDark ? 'bg-purple-500/15' : 'bg-purple-500/30'
              }`} />
            {/* Rotated background card shape */}
            <div className={`absolute left-[-20px] bottom-[-20px] w-20 h-20 border-2 rounded-xl rotate-12 pointer-events-none transition-colors ${isDark ? 'border-purple-500/15 bg-purple-500/[0.03]' : 'border-purple-500/25 bg-purple-500/[0.05]'
              }`} />
            {/* Double outline rings */}
            <div className={`absolute right-[-15px] bottom-[-15px] w-16 h-16 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${isDark ? 'border-purple-500/10' : 'border-purple-500/20'
              }`}>
              <div className={`w-10 h-10 rounded-full border transition-colors ${isDark ? 'border-purple-500/15' : 'border-purple-500/25'}`}></div>
            </div>

            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                  On-Duty Staff
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.activeStaff}{" "}
                  <span className="text-xs text-muted-foreground font-medium">
                    Active
                  </span>
                </h3>
              </div>
              <div className="h-10 w-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Interactive feed splits */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <Card className="xl:col-span-2 shadow-sm border border-border rounded-xl opacity-0 animate-fade-slide-up [animation-delay:350ms]">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-6 border-b border-border bg-muted/10">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  Today's Operational Velocity
                </CardTitle>
                <CardDescription>
                  Visual tracker matching hour-by-hour sales spikes
                </CardDescription>
              </div>

              {/* Chart Metric Selectors */}
              <div className="w-[140px] shrink-0 z-20">
                <CustomDropdown
                  options={[
                    { value: "revenue", label: "Revenue Flow", icon: <BadgeIndianRupee className="h-3.5 w-3.5" /> },
                    { value: "volume", label: "Orders Count", icon: <ShoppingCart className="h-3.5 w-3.5" /> }
                  ]}
                  value={chartMetric}
                  onChange={(v) => setChartMetric(v as "revenue" | "volume")}
                  triggerClassName="h-8 !text-[10px] font-bold"
                />
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="velocityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary-500)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary-500)"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      chartMetric === "revenue" ? `₹${v}` : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value) => [
                      chartMetric === "revenue"
                        ? `₹${value}`
                        : `${value} orders`,
                      chartMetric === "revenue" ? "Sales" : "Dispatches",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary-500)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#velocityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scrolling Monospace Terminal for Live Activity feed */}
          <Card className="flex flex-col h-full border border-border shadow-sm rounded-xl opacity-0 animate-fade-slide-up [animation-delay:400ms]">
            <CardHeader className={`pb-4 rounded-t-xl transition-colors border-b ${isDark
              ? 'bg-slate-900 text-white border-white/5'
              : 'bg-slate-100 text-slate-900 border-slate-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  <CardTitle className="text-xs font-black tracking-widest uppercase">
                    Live Activity Terminal
                  </CardTitle>
                </div>
                <Badge className={`border-none text-[9px] ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                  LIVE LOGS
                </Badge>
              </div>

              {/* Active Search & Filter Controls */}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search logs (e.g. pos, delivery)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-[10px] font-semibold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-foreground"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="w-full sm:w-[130px] shrink-0 z-20">
                  <CustomDropdown
                    options={[
                      { value: 'ALL', label: 'All Channels' },
                      { value: 'POS', label: 'POS Billing' },
                      { value: 'DELIVERY', label: 'Delivery' },
                      { value: 'PICKUP', label: 'Pickup/TV' }
                    ]}
                    value={channelFilter}
                    onChange={setChannelFilter}
                    triggerClassName="h-8 !text-[10px] font-bold"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className={`p-4 flex-1 h-full min-h-0 font-mono text-[10px] space-y-3.5 overflow-y-auto rounded-b-xl select-none transition-colors duration-300 ${isDark
              ? 'bg-slate-950 text-emerald-400'
              : 'bg-zinc-50 text-emerald-700 border-t border-slate-200/50'
              }`}>
              {/* Terminal Logs list */}
              {recentFeed.map((order: any) => {
                const hour = new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return (
                  <div key={order.id} className="space-y-1 animate-page-enter">
                    <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                      [{hour}] LOG_CONN EVENT: {order.id}
                    </p>
                    <p className={`pl-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      &gt; CHANNEL: {order.type} | VALUE: ₹{order.totalAmount}
                    </p>
                    <p className={`pl-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      &gt; STATUS UPDATE &rarr;{" "}
                      <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                );
              })}

              <div className={`pt-2 italic text-[9px] border-t ${isDark ? 'text-slate-500 border-white/5' : 'text-slate-400 border-slate-200'
                }`}>
                *** Listening on store channel events... ***
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Watch Grid */}
        {warningList.length > 0 && (
          <Card className="border-rose-500/25 bg-rose-500/[0.01] shadow-sm rounded-xl opacity-0 animate-fade-slide-up [animation-delay:450ms]">
            <CardHeader className="pb-4 border-b border-rose-500/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
                <div>
                  <CardTitle className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">
                    Critical Inventory Level Warnings
                  </CardTitle>
                  <CardDescription className="text-rose-600/80 dark:text-rose-400/80">
                    The following catalog items are running below designated low
                    stock alert thresholds.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {warningList.map((p: any) => {
                const stockPct = Math.round((p.stock / p.lowStockAt) * 100);
                return (
                  <div
                    key={p.id}
                    className="bg-background border border-rose-500/10 rounded-xl p-4 flex flex-col justify-between shadow-sm relative group hover:shadow"
                  >
                    <button
                      onClick={() => handleDeleteClick(p)}
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
                      title="Dismiss Warning"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h4>
                        <Badge
                          variant="destructive"
                          className="font-black text-[9px] shrink-0"
                        >
                          {p.stock} Qty left
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {p.rackLocation}
                      </p>
                    </div>

                    {/* Progress slider bar */}
                    <div className="mt-4 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, stockPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold">
                        <span>Threshold: {p.lowStockAt} Qty</span>
                        <span>{stockPct}% of limit</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Dismiss Stock Warning"
        description={`This will permanently remove the low stock alert and warnings logs for "${productToDelete?.name}".`}
        itemName={productToDelete?.name}
        confirmText="DISMISS"
      />
    </div>
  );
}
