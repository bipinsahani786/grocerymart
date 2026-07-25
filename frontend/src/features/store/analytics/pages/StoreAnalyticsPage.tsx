import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  BadgeIndianRupee, 
  BarChart3, 
  PieChart as PieIcon, 
  Clock, 
  Award,
  } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useMockStore } from '@/store/mockStore';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell, 
  Pie, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

type ActiveTab = 'sales' | 'products' | 'payments' | 'staff';

const COLORS = ['var(--primary-500)', 'var(--willow-green)', 'var(--carrot-orange)', 'var(--strawberry-red)', 'var(--coral-glow)'];

export default function StoreAnalyticsPage() {
  const { orders, staff } = useMockStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');

  // 1. Calculations for General Stats Cards
  const generalStats = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
    const totalSales = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderVal = activeOrders.length > 0 ? Math.round(totalSales / activeOrders.length) : 0;
    
    // Total items sold
    const totalItems = activeOrders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.qty, 0), 0);
    
    return {
      totalSales,
      avgOrderVal,
      ordersCount: activeOrders.length,
      totalItems
    };
  }, [orders]);

  // 2. Sales Report Data (Grouping last 7 days)
  const salesChartData = useMemo(() => {
    const dates = [];
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map(date => {
      const dayOrders = activeOrders.filter(o => o.createdAt.startsWith(date));
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const label = new Date(date).toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      return {
        day: label,
        Revenue: revenue,
        Orders: dayOrders.length
      };
    });
  }, [orders]);

  // 3. Product Performance Data (Top 5 selling items)
  const productPerformanceData = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
    const counts: Record<string, { name: string; qty: number; value: number }> = {};
    
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.productId]) {
          counts[item.productId] = { name: item.productName, qty: 0, value: 0 };
        }
        counts[item.productId].qty += item.qty;
        counts[item.productId].value += item.price * item.qty;
      });
    });

    const sorted = Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return sorted;
  }, [orders]);

  // 4. Payment Channel Splits
  const paymentSplitData = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
    const methods: Record<string, number> = { UPI: 0, Cash: 0, Card: 0, 'Khata (Credit)': 0 };

    activeOrders.forEach(o => {
      if (methods[o.paymentMethod] !== undefined) {
        methods[o.paymentMethod] += o.totalAmount;
      }
    });

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);
  }, [orders]);

  // 5. Staff KPI Performance Charts
  const staffPerformanceData = useMemo(() => {
    return staff.map(s => ({
      name: s.name,
      'Orders Handled': s.performance.ordersProcessed,
      'Avg Pack Min': s.performance.avgPackTimeMinutes
    }));
  }, [staff]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={BarChart3}
        title="Store Reports & Analytics"
        subtitle="Analyze sales trends, inventory turnover, payment channels and staff performance"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Mini Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Sales Volume"
            value={`₹${generalStats.totalSales.toLocaleString('en-IN')}`}
            subtitle="Excludes voided/refunds"
            icon={<BadgeIndianRupee />}
            color="bg-emerald-50/70 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Average Cart Size"
            value={`₹${generalStats.avgOrderVal}`}
            subtitle="Spend per check-out"
            icon={<TrendingUp />}
            color="bg-primary-50/70 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400"
          />
          <StatCard
            title="Completed Orders"
            value={generalStats.ordersCount}
            subtitle="Fulfillment count"
            icon={<ShoppingCart />}
            color="bg-blue-50/70 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Total Units Handled"
            value={generalStats.totalItems}
            subtitle="Stock items dispatched"
            icon={<Clock />}
            color="bg-purple-50/70 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
          {[
            { id: 'sales', name: 'Sales Report', icon: TrendingUp },
            { id: 'products', name: 'Product Rank', icon: BarChart3 },
            { id: 'payments', name: 'Payment Splits', icon: PieIcon },
            { id: 'staff', name: 'Staff KPIs', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500 font-extrabold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Report Tabs Details */}
        {activeTab === 'sales' && (
          <Card className="animate-page-enter">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-black">Gross Daily Revenue Trend</CardTitle>
              <CardDescription>Visual tracker representing sales over the last 7 calendar days</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="var(--primary-500)" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-page-enter">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-black">Top 5 Best-Selling Products</CardTitle>
                <CardDescription>Aggregated quantity sold from all invoices</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {productPerformanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No sales data logged yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformanceData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                      <Bar dataKey="qty" name="Qty Sold" fill="var(--primary-500)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-black">Item Value Ranking</CardTitle>
                <CardDescription>Aggregated gross selling volume breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto max-h-[320px]">
                {productPerformanceData.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground font-semibold">No product invoices.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {productPerformanceData.map((item, idx) => (
                      <div key={item.name} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-slate-400">#{idx + 1}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-950 dark:text-white">₹{item.value}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.qty} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-page-enter">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-black">Revenue Split by Payment Gateway</CardTitle>
                <CardDescription>Gross split of success payments from channels</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] flex items-center justify-center">
                {paymentSplitData.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No payments registered.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentSplitData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentSplitData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-black">Gateway Ledger</CardTitle>
                <CardDescription>Credit balances log breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {paymentSplitData.map((item, idx) => (
                    <div key={item.name} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="h-3 w-3 rounded-full shrink-0" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-950 dark:text-white">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'staff' && (
          <Card className="animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Staff Performance & Handling Speeds</CardTitle>
              <CardDescription>Aggregated checkout and picker speed logs</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffPerformanceData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar dataKey="Orders Handled" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Avg Pack Min" name="Avg Speed (Mins)" fill="var(--willow-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
