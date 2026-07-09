import { BadgeIndianRupee, ClipboardList, Package, ShoppingCart, Store } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoreManagerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const store = user?.store;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        icon={Store}
        title="Store Dashboard"
        subtitle="Daily store operations, orders, catalog and revenue"
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Signed in as</p>
              <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{user?.name || 'Store Manager'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || user?.phone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Store Manager</Badge>
              <Badge variant={store ? 'outline' : 'warning'}>{store?.name || 'Store not assigned'}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Today Orders" value="0" icon={ShoppingCart} />
          <MetricCard title="Pending Tasks" value="0" icon={ClipboardList} />
          <MetricCard title="Products" value="0" icon={Package} />
          <MetricCard title="Today Revenue" value="₹0" icon={BadgeIndianRupee} />
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Store panel ready</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This manager account now lands on the store panel after login. Operational modules can plug into this dashboard as they are added.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
