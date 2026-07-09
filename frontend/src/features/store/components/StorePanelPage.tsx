import type { LucideIcon } from 'lucide-react';
import {
  BadgeIndianRupee,
  Barcode,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FileText,
  Package,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type SectionKey = 'pos' | 'orders' | 'pickup' | 'products' | 'inventory' | 'billing' | 'staff' | 'search' | 'analytics';

interface StatItem {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}

interface PanelItem {
  title: string;
  meta: string;
  status: string;
  badge?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

interface SectionConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  primaryAction: string;
  secondaryAction: string;
  searchPlaceholder: string;
  stats: StatItem[];
  workTitle: string;
  workItems: PanelItem[];
  actionTitle: string;
  actionFields: string[];
  footerTitle: string;
  footerItems: PanelItem[];
}

const configs: Record<SectionKey, SectionConfig> = {
  pos: {
    title: 'POS Counter',
    subtitle: 'Touch friendly walk-in billing, cart checkout, discounts and receipt printing',
    icon: ShoppingCart,
    primaryAction: 'New Order',
    secondaryAction: 'Recall Hold',
    searchPlaceholder: 'Scan barcode or search product...',
    stats: [
      { label: 'Open Cart', value: 'Rs 0', note: 'No active sale', icon: ReceiptText },
      { label: 'Quick Items', value: '24', note: 'Pinned products', icon: Package },
      { label: 'Held Orders', value: '3', note: 'Waiting customers', icon: ClipboardCheck },
      { label: 'Payments', value: '4', note: 'Cash, UPI, Card, Split', icon: CreditCard },
    ],
    workTitle: 'Current Order',
    workItems: [
      { title: 'Kurkure 26g x 2', meta: 'Rack A2-S3 | Rs 20', status: 'Ready', badge: 'success' },
      { title: 'Amul Milk 500ml x 1', meta: 'Cold Zone 1 | Rs 28', status: 'Tax 5%', badge: 'outline' },
      { title: 'Bisleri 1L x 3', meta: 'Rack C1-S1 | Rs 60', status: 'Ready', badge: 'success' },
    ],
    actionTitle: 'Checkout',
    actionFields: ['Customer phone', 'Discount amount', 'Payment reference'],
    footerTitle: 'Quick Categories',
    footerItems: [
      { title: 'Dairy', meta: 'Milk, curd, paneer', status: '18 items', badge: 'secondary' },
      { title: 'Snacks', meta: 'Chips, namkeen, biscuits', status: '31 items', badge: 'secondary' },
      { title: 'Staples', meta: 'Rice, atta, pulses', status: '42 items', badge: 'secondary' },
    ],
  },
  orders: {
    title: 'Order Queue',
    subtitle: 'Accept, pack and track POS, delivery and online store orders',
    icon: ClipboardCheck,
    primaryAction: 'Accept Next',
    secondaryAction: 'Batch Pack',
    searchPlaceholder: 'Search order, customer or token...',
    stats: [
      { label: 'Placed', value: '8', note: 'Needs action', icon: CalendarClock },
      { label: 'Packing', value: '5', note: 'Picker queue', icon: PackageCheck },
      { label: 'Delivery', value: '4', note: 'Awaiting rider', icon: ShoppingCart },
      { label: 'Completed', value: '36', note: 'Today', icon: ClipboardCheck },
    ],
    workTitle: 'Live Orders',
    workItems: [
      { title: '#DEL-1234 Rahul Kumar', meta: 'Delivery | 7 items | 2.3 km', status: 'PLACED', badge: 'warning' },
      { title: '#POS-2241 Walk-in', meta: 'Counter 1 | Cash paid', status: 'COMPLETED', badge: 'success' },
      { title: '#CC-7781 Priya Sharma', meta: 'Pickup | 4 items', status: 'PACKING', badge: 'outline' },
    ],
    actionTitle: 'Order Action',
    actionFields: ['Order number', 'Internal note', 'Delay reason'],
    footerTitle: 'Picker Checklist',
    footerItems: [
      { title: 'Sort by rack route', meta: 'A zone to cold zone to C zone', status: 'Optimized', badge: 'success' },
      { title: 'Item unavailable flow', meta: 'Mark N/A and alert manager', status: 'Ready', badge: 'outline' },
    ],
  },
  pickup: {
    title: 'Pickup Queue',
    subtitle: 'Click & Collect packing queue, ready board and counter handover',
    icon: PackageCheck,
    primaryAction: 'Mark Ready',
    secondaryAction: 'Board Mode',
    searchPlaceholder: 'Enter pickup PIN or token...',
    stats: [
      { label: 'Packing', value: '6', note: 'Current slots', icon: Boxes },
      { label: 'Ready', value: '4', note: 'Waiting pickup', icon: PackageCheck },
      { label: 'Collected', value: '17', note: 'Today', icon: UserCheck },
      { label: 'Slot Load', value: '70%', note: 'Next 15 min', icon: CalendarClock },
    ],
    workTitle: 'Pickup Board',
    workItems: [
      { title: 'Token #1234 - Rahul Kumar', meta: 'PIN 4821 | 5 items', status: 'READY', badge: 'success' },
      { title: 'Token #1235 - Priya Sharma', meta: 'PIN 1904 | 3 items', status: 'PACKING', badge: 'warning' },
      { title: 'Token #1236 - Amit Singh', meta: 'PIN 8320 | 8 items', status: 'PACKING', badge: 'warning' },
    ],
    actionTitle: 'Handover',
    actionFields: ['Pickup PIN', 'Customer phone', 'Counter note'],
    footerTitle: 'Slot Controls',
    footerItems: [
      { title: 'Max orders per 15 min', meta: 'Capacity guard for packing team', status: '10', badge: 'outline' },
      { title: 'Pickup valid window', meta: 'After ready notification', status: '2 hr', badge: 'outline' },
    ],
  },
  products: {
    title: 'Product Catalog',
    subtitle: 'Manage simple, weighted, variant, bundle, service and perishable products',
    icon: Package,
    primaryAction: 'Add Product',
    secondaryAction: 'Bulk Import',
    searchPlaceholder: 'Search product, SKU, barcode or brand...',
    stats: [
      { label: 'Products', value: '248', note: 'Active catalog', icon: Package },
      { label: 'Online Visible', value: '211', note: 'Shown in app', icon: ShoppingCart },
      { label: 'Variants', value: '38', note: 'Size/color/pack', icon: Boxes },
      { label: 'Barcodes', value: '196', note: 'Scan ready', icon: Barcode },
    ],
    workTitle: 'Catalog Items',
    workItems: [
      { title: 'Amul Milk 500ml', meta: 'SKU AM-MILK-500 | Dairy', status: 'Online + POS', badge: 'success' },
      { title: 'Tropicana Juice 1L', meta: 'Variant parent | Drinks', status: '3 variants', badge: 'outline' },
      { title: 'Gift Wrapping', meta: 'Service item | No stock', status: 'POS only', badge: 'secondary' },
    ],
    actionTitle: 'Product Form',
    actionFields: ['Product name', 'SKU / Barcode', 'MRP / Selling price'],
    footerTitle: 'Bulk Operations',
    footerItems: [
      { title: 'CSV import', meta: 'Upload products and stock together', status: 'Template', badge: 'outline' },
      { title: 'Bulk price update', meta: 'Select products and update margin', status: 'Ready', badge: 'outline' },
      { title: 'Barcode labels', meta: 'Generate print sheet', status: 'PDF', badge: 'outline' },
    ],
  },
  inventory: {
    title: 'Unified Inventory',
    subtitle: 'Single stock source shared by POS, delivery and Click & Collect',
    icon: Boxes,
    primaryAction: 'Adjust Stock',
    secondaryAction: 'Low Stock',
    searchPlaceholder: 'Search inventory by item, SKU or rack...',
    stats: [
      { label: 'Stock Value', value: 'Rs 2.4L', note: 'At cost', icon: BadgeIndianRupee },
      { label: 'Low Stock', value: '12', note: 'Below threshold', icon: Boxes },
      { label: 'Expiring', value: '7', note: 'Next 5 days', icon: CalendarClock },
      { label: 'Locations', value: '18', note: 'Rack zones', icon: PackageCheck },
    ],
    workTitle: 'Stock Watch',
    workItems: [
      { title: 'Amul Milk 500ml', meta: 'Qty 8 | Threshold 10 | Cold Zone 1', status: 'LOW', badge: 'warning' },
      { title: 'Kurkure 26g', meta: 'Qty 47 | Rack A2-S3', status: 'OK', badge: 'success' },
      { title: 'Fresh Apples 1kg', meta: 'Qty 12 | Expires soon', status: 'EXPIRY', badge: 'warning' },
    ],
    actionTitle: 'Stock Adjustment',
    actionFields: ['Product / barcode', 'Quantity delta', 'Adjustment reason'],
    footerTitle: 'Inventory Rules',
    footerItems: [
      { title: 'Deduct on POS bill', meta: 'Immediate stock lock', status: 'Enabled', badge: 'success' },
      { title: 'Deduct on online payment', meta: 'Prevents oversell', status: 'Enabled', badge: 'success' },
      { title: 'Low stock alerts', meta: 'Manager notification', status: 'Enabled', badge: 'success' },
    ],
  },
  billing: {
    title: 'Billing & Invoices',
    subtitle: 'Thermal receipts, GST invoices, reprints, refunds and cash reconciliation',
    icon: FileText,
    primaryAction: 'Reprint Bill',
    secondaryAction: 'Cash Close',
    searchPlaceholder: 'Search bill number, order or customer...',
    stats: [
      { label: 'Bills Today', value: '53', note: 'POS + pickup', icon: ReceiptText },
      { label: 'Cash Sales', value: 'Rs 8,200', note: 'Counter total', icon: BadgeIndianRupee },
      { label: 'UPI Sales', value: 'Rs 12,400', note: 'Auto + manual', icon: CreditCard },
      { label: 'Refunds', value: '2', note: 'Manager approved', icon: FileText },
    ],
    workTitle: 'Recent Bills',
    workItems: [
      { title: 'POS-2024-00847', meta: 'Walk-in | UPI | Rs 102.06', status: 'Receipt', badge: 'success' },
      { title: 'GST-2024-00031', meta: 'B2B invoice | Rs 4,820', status: 'GST', badge: 'outline' },
      { title: 'REF-2024-00009', meta: 'Return receipt | Rs 300', status: 'Refund', badge: 'warning' },
    ],
    actionTitle: 'Bill Tools',
    actionFields: ['Bill number', 'Customer GSTIN', 'Void reason'],
    footerTitle: 'Reconciliation',
    footerItems: [
      { title: 'Opening balance', meta: 'Cash drawer', status: 'Rs 500', badge: 'outline' },
      { title: 'Expected cash', meta: 'Sales minus refunds', status: 'Rs 8,400', badge: 'success' },
      { title: 'Card received', meta: 'Terminal settlement', status: 'Rs 23,800', badge: 'outline' },
    ],
  },
  staff: {
    title: 'Staff Management',
    subtitle: 'Roles, PIN login, shifts, performance and picker efficiency',
    icon: Users,
    primaryAction: 'Add Staff',
    secondaryAction: 'Clock In',
    searchPlaceholder: 'Search staff, role or shift...',
    stats: [
      { label: 'On Shift', value: '6', note: 'Active staff', icon: UserCheck },
      { label: 'Cashiers', value: '2', note: 'POS counters', icon: ShoppingCart },
      { label: 'Pickers', value: '3', note: 'Packing queue', icon: PackageCheck },
      { label: 'Avg Bill', value: 'Rs 174', note: 'Cashier KPI', icon: TrendingUp },
    ],
    workTitle: 'Staff Performance',
    workItems: [
      { title: 'Raju Kumar', meta: 'Morning | 47 orders | Rs 8,200', status: 'Cashier', badge: 'success' },
      { title: 'Priya Sharma', meta: 'Evening | 38 orders | Rs 6,100', status: 'Cashier', badge: 'success' },
      { title: 'Amit Singh', meta: 'Picker | 4.2 min avg pack time', status: 'Picker', badge: 'outline' },
    ],
    actionTitle: 'Staff Form',
    actionFields: ['Name / phone', 'Role', 'Login PIN'],
    footerTitle: 'Shift Controls',
    footerItems: [
      { title: 'Morning', meta: '8:00 AM - 2:00 PM', status: 'Active', badge: 'success' },
      { title: 'Evening', meta: '2:00 PM - 8:00 PM', status: 'Next', badge: 'outline' },
      { title: 'Night', meta: '8:00 PM - 2:00 AM', status: 'Optional', badge: 'secondary' },
    ],
  },
  search: {
    title: 'Fast Search',
    subtitle: 'Barcode lookup, fuzzy product search and rack-first order execution',
    icon: Search,
    primaryAction: 'Focus Search',
    secondaryAction: 'Scan Mode',
    searchPlaceholder: 'Type 2-3 letters, SKU or barcode...',
    stats: [
      { label: 'Response', value: '150ms', note: 'Debounced search', icon: Search },
      { label: 'Barcode Hits', value: '96%', note: 'Exact lookup', icon: Barcode },
      { label: 'Popular Boost', value: 'On', note: 'Sales count rank', icon: TrendingUp },
      { label: 'Rack Sort', value: 'On', note: 'Picker route', icon: PackageCheck },
    ],
    workTitle: 'Search Results',
    workItems: [
      { title: 'kur -> Kurkure 26g', meta: 'Starts-with match | Rack A2-S3', status: 'Top', badge: 'success' },
      { title: 'amul -> Amul Milk 500ml', meta: 'Brand + product match', status: 'Cold', badge: 'outline' },
      { title: '890123 -> Bisleri 1L', meta: 'Barcode exact match', status: 'Exact', badge: 'success' },
    ],
    actionTitle: 'Lookup Tools',
    actionFields: ['Search query', 'Barcode value', 'Rack zone filter'],
    footerTitle: 'Execution Helpers',
    footerItems: [
      { title: 'F2 search focus', meta: 'POS keyboard shortcut', status: 'Enabled', badge: 'success' },
      { title: 'F10 payment screen', meta: 'Fast checkout jump', status: 'Enabled', badge: 'success' },
      { title: 'Route optimization', meta: 'Sort by rack zones', status: 'Enabled', badge: 'success' },
    ],
  },
  analytics: {
    title: 'Store Analytics',
    subtitle: 'Sales, products, payment methods, staff KPIs and hourly load',
    icon: TrendingUp,
    primaryAction: 'Export Report',
    secondaryAction: 'Today',
    searchPlaceholder: 'Search metric or report...',
    stats: [
      { label: 'Revenue', value: 'Rs 44,400', note: 'Today', icon: BadgeIndianRupee },
      { label: 'Orders', value: '53', note: 'All channels', icon: ClipboardCheck },
      { label: 'Avg Order', value: 'Rs 838', note: 'Blended', icon: TrendingUp },
      { label: 'Pack Time', value: '4.8m', note: 'Picker average', icon: PackageCheck },
    ],
    workTitle: 'Channel Split',
    workItems: [
      { title: 'POS Walk-in', meta: '31 orders | Rs 18,200', status: '41%', badge: 'success' },
      { title: 'Online Delivery', meta: '14 orders | Rs 17,900', status: '40%', badge: 'outline' },
      { title: 'Click & Collect', meta: '8 orders | Rs 8,300', status: '19%', badge: 'secondary' },
    ],
    actionTitle: 'Report Filters',
    actionFields: ['Date range', 'Channel', 'Staff member'],
    footerTitle: 'Top Products',
    footerItems: [
      { title: 'Amul Milk 500ml', meta: '86 units sold', status: 'Rs 2,408', badge: 'success' },
      { title: 'Kurkure 26g', meta: '74 units sold', status: 'Rs 740', badge: 'success' },
      { title: 'Bisleri 1L', meta: '63 units sold', status: 'Rs 1,260', badge: 'success' },
    ],
  },
};

function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate">{item.label}</p>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white truncate">{item.value}</p>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground truncate">{item.note}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function ItemList({ items }: { items: PanelItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={`${item.title}-${item.status}`} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/40 p-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground truncate">{item.meta}</p>
          </div>
          <Badge variant={item.badge || 'outline'} className="shrink-0">{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

export function StorePanelPage({ section }: { section: SectionKey }) {
  const config = configs[section];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader icon={Icon} title={config.title} subtitle={config.subtitle} />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Input icon={<Search className="h-4 w-4" />} placeholder={config.searchPlaceholder} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">{config.primaryAction}</Button>
            <Button size="sm" variant="outline">{config.secondaryAction}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {config.stats.map((item) => <StatCard key={item.label} item={item} />)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-primary-500" />
                {config.workTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ItemList items={config.workItems} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{config.actionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.actionFields.map((field, index) => (
                index === 1 ? (
                  <Select key={field}>
                    <option>{field}</option>
                    <option>Primary</option>
                    <option>Secondary</option>
                    <option>Manager approval</option>
                  </Select>
                ) : (
                  <Input key={field} placeholder={field} />
                )
              ))}
              <Textarea placeholder="Notes / instructions" className="min-h-24" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="outline">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{config.footerTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {config.footerItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-border p-4 bg-background/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{item.meta}</p>
                    </div>
                    <Badge variant={item.badge || 'outline'}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
