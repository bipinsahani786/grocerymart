import { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  UserPlus,
  BookOpen,
  Award,
  Smartphone,
  Check,
  Receipt,
  Edit3,
  Trash2,
  Mail,
  Eye
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import {
  useStoreCustomers,
  useCreateStoreCustomer,
  useUpdateStoreCustomer,
  useDeleteStoreCustomer
} from '@/features/store/api/useStorePanel';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'sonner';

export default function StoreCustomersPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id || (user as any)?.storeId || (user as any)?.managedStore?.id;

  const { data: customersData, isLoading } = useStoreCustomers(storeId);
  const customers = customersData || [];

  const createCustomerMutation = useCreateStoreCustomer();
  const updateCustomerMutation = useUpdateStoreCustomer();
  const deleteCustomerMutation = useDeleteStoreCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [khataFilter, setKhataFilter] = useState<'ALL' | 'OWED' | 'CLEAR' | 'ADVANCE'>('ALL');

  // Customer Ledger Details Modal State
  const [viewingLedgerCustomer, setViewingLedgerCustomer] = useState<any>(null);

  // Register Customer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editCustForm, setEditCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    khataBalance: '0',
    notes: '',
  });

  // Delete Customer Modal State
  const [deletingCustomer, setDeletingCustomer] = useState<any>(null);

  // Record Khata Payment / Credit Entry State
  const [khataModalCustomer, setKhataModalCustomer] = useState<any>(null);
  const [khataEntryType, setKhataEntryType] = useState<'PAYMENT' | 'CREDIT'>('PAYMENT');
  const [khataAmount, setKhataAmount] = useState('');
  const [khataNote, setKhataNote] = useState('');

  // Validation Helper
  const validateForm = (name: string, phone: string, email: string) => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Customer name must be at least 2 characters.');
      return false;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
      toast.error('Compulsory: Valid 10-digit mobile phone number is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      toast.error('Invalid email address format.');
      return false;
    }
    return true;
  };

  // 1. KPI Computations
  const totalCustomersCount = customers.length;
  const totalRevenueLtv = useMemo(() => {
    return customers.reduce((sum: number, c: any) => sum + (Number(c.totalSpent) || 0), 0);
  }, [customers]);

  const totalKhataReceivables = useMemo(() => {
    return customers.reduce((sum: number, c: any) => {
      const bal = Number(c.khataBalance) || 0;
      return bal > 0 ? sum + bal : sum;
    }, 0);
  }, [customers]);

  const activeKhataAccounts = useMemo(() => {
    return customers.filter((c: any) => (Number(c.khataBalance) || 0) !== 0).length;
  }, [customers]);

  // 2. Filter Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q);

      const bal = Number(c.khataBalance) || 0;
      let matchesKhata = true;
      if (khataFilter === 'OWED') matchesKhata = bal > 0;
      else if (khataFilter === 'ADVANCE') matchesKhata = bal < 0;
      else if (khataFilter === 'CLEAR') matchesKhata = bal === 0;

      return matchesSearch && matchesKhata;
    });
  }, [customers, searchQuery, khataFilter]);

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(newCustForm.name, newCustForm.phone, newCustForm.email)) return;

    createCustomerMutation.mutate(
      {
        storeId,
        name: newCustForm.name.trim(),
        phone: newCustForm.phone.trim(),
        email: newCustForm.email.trim(),
      },
      {
        onSuccess: () => {
          setNewCustForm({ name: '', phone: '', email: '' });
          setShowAddModal(false);
        },
      }
    );
  };

  const handleOpenEditModal = (cust: any) => {
    setEditingCustomer(cust);
    setEditCustForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      khataBalance: String(cust.khataBalance || 0),
      notes: cust.notes || '',
    });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!validateForm(editCustForm.name, editCustForm.phone, editCustForm.email)) return;

    updateCustomerMutation.mutate(
      {
        id: editingCustomer.id,
        storeId,
        name: editCustForm.name.trim(),
        phone: editCustForm.phone.trim(),
        email: editCustForm.email.trim(),
        khataBalance: parseFloat(editCustForm.khataBalance) || 0,
        notes: editCustForm.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setEditingCustomer(null);
        },
      }
    );
  };

  const handleDeleteCustomerConfirm = () => {
    if (!deletingCustomer) return;

    deleteCustomerMutation.mutate(
      { id: deletingCustomer.id, storeId },
      {
        onSuccess: () => {
          setDeletingCustomer(null);
        },
      }
    );
  };

  const handleRecordKhataEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khataModalCustomer) return;
    const amt = parseFloat(khataAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    const currentBal = Number(khataModalCustomer.khataBalance) || 0;
    const newBal = khataEntryType === 'PAYMENT' ? currentBal - amt : currentBal + amt;

    updateCustomerMutation.mutate(
      {
        id: khataModalCustomer.id,
        storeId,
        khataBalance: newBal,
      },
      {
        onSuccess: () => {
          const actionText = khataEntryType === 'PAYMENT' ? 'Payment received' : 'Credit issued';
          toast.success(`${actionText} ₹${amt} recorded for ${khataModalCustomer?.name}!`);
          setKhataModalCustomer(null);
          setKhataAmount('');
          setKhataNote('');
        },
      }
    );
  };

  // DataTable Columns (Full Width)
  const customerColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Customer Details',
      accessorKey: 'name',
      sortable: true,
      cell: (cust) => {
        const initials = (cust.name || 'Customer')
          .split(' ')
          .map((n: string) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs shrink-0 border border-primary-500/20">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate">{cust.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <Smartphone className="h-3 w-3 text-primary-500" />
                  {cust.phone}
                </span>
                {cust.email && (
                  <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {cust.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Orders & LTV',
      accessorKey: 'totalSpent',
      sortable: true,
      cell: (cust) => (
        <div className="space-y-1">
          <div className="font-mono font-black text-sm text-foreground">
            ₹{Number(cust.totalSpent || 0).toLocaleString('en-IN')}
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5">
            {cust.totalOrders || 0} {cust.totalOrders === 1 ? 'order' : 'orders'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Khata Ledger',
      accessorKey: 'khataBalance',
      sortable: true,
      cell: (cust) => {
        const bal = Number(cust.khataBalance) || 0;
        if (bal > 0) {
          return (
            <Badge variant="warning" className="font-black text-[10px] uppercase px-2.5 py-1 border border-amber-500/30">
              Owes ₹{bal.toLocaleString('en-IN')}
            </Badge>
          );
        }
        if (bal < 0) {
          return (
            <Badge variant="success" className="font-black text-[10px] uppercase px-2.5 py-1">
              Advance ₹{Math.abs(bal).toLocaleString('en-IN')}
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="font-bold text-[10px] uppercase px-2.5 py-1 text-muted-foreground bg-muted/40">
            Clear ₹0
          </Badge>
        );
      },
    },
    {
      header: 'Loyalty Points',
      accessorKey: 'loyaltyPoints',
      sortable: true,
      cell: (cust) => (
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4 text-amber-500" />
          <span className="font-mono font-bold text-xs text-foreground">
            {cust.loyaltyPoints || 0} pts
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (cust) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="brand"
            onClick={(e) => {
              e.stopPropagation();
              setViewingLedgerCustomer(cust);
            }}
            className="h-8 px-2.5 text-xs font-bold gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            Ledger
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(cust);
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Edit Customer"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingCustomer(cust);
            }}
            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Customer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Users}
        title="Customer Directory & Khata Book"
        subtitle="Manage customer relationships, order history, loyalty points, and credit khata accounts"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-3 pb-6 space-y-6">

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-page-enter">
          <CustomKpiCard
            title="Total Store Customers"
            value={totalCustomersCount}
            subtitle="Store customer records"
            icon={<Users />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Customer LTV Revenue"
            value={`₹${totalRevenueLtv.toLocaleString('en-IN')}`}
            subtitle="Total lifetime spend"
            icon={<TrendingUp />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Khata Receivables"
            value={`₹${totalKhataReceivables.toLocaleString('en-IN')}`}
            subtitle="Pending credit dues"
            icon={<BookOpen />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Active Khata Accounts"
            value={activeKhataAccounts}
            subtitle="Accounts with credit balance"
            icon={<Receipt />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
        </div>

        {/* ── Full Width DataTable & FilterBar ── */}
        <div className="space-y-4 w-full">
          
          {/* Filter Bar & Register Action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-card border border-border p-3 rounded-xl shadow-xs">
            <div className="flex-1 max-w-sm">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, phone or email..."
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-48 shrink-0">
                <CustomDropdown
                  options={[
                    { value: 'ALL', label: 'All Accounts' },
                    { value: 'OWED', label: 'Credit Owed (Due)' },
                    { value: 'ADVANCE', label: 'Advance Prepaid' },
                    { value: 'CLEAR', label: 'Clear Balance' },
                  ]}
                  value={khataFilter}
                  onChange={(val) => setKhataFilter(val)}
                  placeholder="Filter Khata Status"
                />
              </div>

              <Button
                size="sm"
                variant="brand"
                onClick={() => setShowAddModal(true)}
                className="gap-1.5 font-bold shadow-xs whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4" /> Register Customer
              </Button>
            </div>
          </div>

          {/* Full Width Customers DataTable */}
          <DataTable
            data={filteredCustomers}
            columns={customerColumns}
            isLoading={isLoading}
            searchable={false}
            itemsPerPage={10}
            onRowClick={(cust) => setViewingLedgerCustomer(cust)}
            emptyMessage="No customer records found matching query."
          />
        </div>

      </div>

      {/* ── VIEW CUSTOMER LEDGER & DETAILS MODAL ── */}
      <Modal
        isOpen={Boolean(viewingLedgerCustomer)}
        onClose={() => setViewingLedgerCustomer(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm border border-primary-500/20">
              {(viewingLedgerCustomer?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-base font-black text-foreground block">{viewingLedgerCustomer?.name}</span>
              <span className="text-xs text-muted-foreground font-normal">{viewingLedgerCustomer?.phone}</span>
            </div>
          </div>
        }
        maxWidth="2xl"
      >
        {viewingLedgerCustomer && (
          <div className="space-y-6">
            {/* Key Customer Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime Spend</span>
                <p className="text-xl font-black text-foreground mt-1">
                  ₹{Number(viewingLedgerCustomer.totalSpent || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khata Balance</span>
                <p className={`text-xl font-black mt-1 ${
                  (viewingLedgerCustomer.khataBalance || 0) > 0 ? 'text-amber-600 dark:text-amber-400' :
                  (viewingLedgerCustomer.khataBalance || 0) < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                }`}>
                  ₹{Math.abs(viewingLedgerCustomer.khataBalance || 0).toLocaleString('en-IN')}
                  {(viewingLedgerCustomer.khataBalance || 0) > 0 && <span className="text-xs font-bold text-amber-500 ml-1">(Due)</span>}
                  {(viewingLedgerCustomer.khataBalance || 0) < 0 && <span className="text-xs font-bold text-emerald-500 ml-1">(Adv)</span>}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loyalty Points</span>
                <p className="text-xl font-black text-amber-500 mt-1 flex items-center gap-1">
                  <Award className="h-5 w-5" /> {viewingLedgerCustomer.loyaltyPoints || 0} pts
                </p>
              </div>
            </div>

            {/* Quick Actions & Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <div className="space-y-1">
                {viewingLedgerCustomer.email && (
                  <p className="text-muted-foreground">Email: <span className="font-semibold text-foreground">{viewingLedgerCustomer.email}</span></p>
                )}
                <p className="text-muted-foreground">Total Orders: <span className="font-bold text-foreground">{viewingLedgerCustomer.totalOrders || 0} orders</span></p>
              </div>

              <Button
                size="sm"
                variant="brand"
                onClick={() => {
                  setKhataModalCustomer(viewingLedgerCustomer);
                  setViewingLedgerCustomer(null);
                }}
                className="font-bold gap-1.5 text-xs shadow-xs"
              >
                <Receipt className="h-4 w-4" /> Record Khata Entry
              </Button>
            </div>

            {/* Recent Channel Orders Ledger */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  Recent Channel Order Activity
                </h4>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {(viewingLedgerCustomer?.orders || []).length} orders logged
                </Badge>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {(viewingLedgerCustomer?.orders || []).length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    No recent channel orders logged for this customer.
                  </div>
                ) : (
                  (viewingLedgerCustomer.orders || []).map((order: any) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-card hover:border-primary-500/30 transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-foreground block">
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        <Badge
                          variant={order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'success' : 'outline'}
                          className="text-[9px] font-extrabold uppercase mt-0.5 inline-block"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── REGISTER NEW CUSTOMER MODAL ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-500" />
            <span>Register New Customer</span>
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleRegisterCustomer} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Full Name *</label>
            <Input
              placeholder="e.g. Ramesh Kumar"
              value={newCustForm.name}
              onChange={(e) => setNewCustForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mobile Phone Number (10 Digits) *</label>
            <Input
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={newCustForm.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setNewCustForm(p => ({ ...p, phone: val }));
              }}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
            <Input
              type="email"
              placeholder="e.g. ramesh@example.com"
              value={newCustForm.email}
              onChange={(e) => setNewCustForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={createCustomerMutation.isPending} className="font-bold gap-1.5">
              <Check className="h-4 w-4" /> Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT CUSTOMER MODAL ── */}
      <Modal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        title={
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary-500" />
            <span>Edit Customer Details — {editingCustomer?.name}</span>
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Full Name *</label>
            <Input
              placeholder="Full Name"
              value={editCustForm.name}
              onChange={(e) => setEditCustForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mobile Phone Number (10 Digits) *</label>
            <Input
              placeholder="10 digit phone"
              maxLength={10}
              value={editCustForm.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setEditCustForm(p => ({ ...p, phone: val }));
              }}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
            <Input
              type="email"
              placeholder="Email address"
              value={editCustForm.email}
              onChange={(e) => setEditCustForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Khata Ledger Balance (₹)</label>
            <Input
              type="number"
              placeholder="0"
              value={editCustForm.khataBalance}
              onChange={(e) => setEditCustForm(p => ({ ...p, khataBalance: e.target.value }))}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditingCustomer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={updateCustomerMutation.isPending} className="font-bold gap-1.5">
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── DELETE CUSTOMER CONFIRMATION MODAL ── */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteCustomerConfirm}
        title="Delete Customer Record"
        description={`Are you sure you want to delete customer record "${deletingCustomer?.name}"? All associated Khata history records will be permanently removed.`}
        itemName={deletingCustomer?.name}
      />

      {/* ── RECORD KHATA ENTRY MODAL ── */}
      <Modal
        isOpen={Boolean(khataModalCustomer)}
        onClose={() => setKhataModalCustomer(null)}
        title={
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary-500" />
            <span>Record Khata Entry — {khataModalCustomer?.name}</span>
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleRecordKhataEntry} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border font-bold text-xs">
            <button
              type="button"
              onClick={() => setKhataEntryType('PAYMENT')}
              className={`py-2 rounded-lg transition-colors ${
                khataEntryType === 'PAYMENT'
                  ? 'bg-emerald-500 text-white shadow-xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Collect Due / Payment
            </button>
            <button
              type="button"
              onClick={() => setKhataEntryType('CREDIT')}
              className={`py-2 rounded-lg transition-colors ${
                khataEntryType === 'CREDIT'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Give Credit (Udhar)
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Amount (₹) *</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={khataAmount}
              onChange={(e) => setKhataAmount(e.target.value)}
              required
              min={1}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Note / Reference (Optional)</label>
            <Input
              placeholder="e.g. Cash collected / Monthly ration credit"
              value={khataNote}
              onChange={(e) => setKhataNote(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setKhataModalCustomer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={updateCustomerMutation.isPending} className="font-bold gap-1.5">
              <Check className="h-4 w-4" /> Save Khata Entry
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
