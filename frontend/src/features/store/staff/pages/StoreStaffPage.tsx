import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Calendar,
  TrendingUp,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Mail,
  Loader2,
  Trash2,
  UserCheck,
  CreditCard,
  Truck,
  UserPlus,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import {
  useStoreStaff,
  useCreateStoreStaff,
  useUpdateStoreStaff,
  useDeleteStoreStaff,
  useToggleStoreStaffClock,
  useUpdateStoreStaffShift
} from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';

type ActiveTab = 'directory' | 'add' | 'shifts' | 'performance';

export default function StoreStaffPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id || (user as any)?.storeId || (user as any)?.managedStore?.id;

  const { data: staffData, isLoading } = useStoreStaff(storeId);
  const createStaff = useCreateStoreStaff();
  const updateStaff = useUpdateStoreStaff();
  const deleteStaff = useDeleteStoreStaff();
  const toggleClock = useToggleStoreStaffClock();
  const updateShift = useUpdateStoreStaffShift();

  const staff = useMemo(() => {
    if (Array.isArray(staffData)) return staffData;
    if (staffData && Array.isArray((staffData as any).data)) return (staffData as any).data;
    if (staffData && Array.isArray((staffData as any).staff)) return (staffData as any).staff;
    return [];
  }, [staffData]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Edit & Delete Staff Modal States
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CASHIER',
    pin: '',
    shift: 'Morning',
    isActive: true,
  });

  const roleOptions = [
    { value: 'CASHIER', label: 'POS Cashier Counter' },
    { value: 'PICKER', label: 'Order Picker / Packer' },
    { value: 'DELIVERY_PARTNER', label: 'Delivery Rider Partner' },
    { value: 'STORE_MANAGER', label: 'Assistant Store Manager' }
  ];

  const roleFilterOptions = [
    { value: 'ALL', label: 'All Staff Roles' },
    { value: 'CASHIER', label: 'POS Cashiers' },
    { value: 'PICKER', label: 'Order Pickers' },
    { value: 'DELIVERY_PARTNER', label: 'Delivery Riders' },
    { value: 'STORE_MANAGER', label: 'Store Managers' }
  ];

  const shiftOptions = [
    { value: 'Morning', label: 'Morning Shift (7:00 AM - 3:00 PM)' },
    { value: 'Evening', label: 'Evening Shift (3:00 PM - 11:00 PM)' },
    { value: 'Night', label: 'Night Shift (11:00 PM - 7:00 AM)' },
    { value: 'Off', label: 'Scheduled Off' }
  ];

  const shiftRosterOptions = [
    { value: '', label: '-- SELECT SHIFT --' },
    { value: 'Morning', label: 'Morning (7:00 AM - 3:00 PM)' },
    { value: 'Evening', label: 'Evening (3:00 PM - 11:00 PM)' },
    { value: 'Night', label: 'Night (11:00 PM - 7:00 AM)' },
    { value: 'Off', label: 'Scheduled Off' }
  ];

  // Add Staff Form state
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CASHIER',
    pin: '',
    shift: 'Morning',
  });

  // Comprehensive Input Validator
  const validateStaffInput = (data: { name: string; phone: string; email: string; pin?: string; role: string }, isEdit = false): string | null => {
    if (!data.name.trim() || data.name.trim().length < 2) {
      return 'Full Name is required (minimum 2 characters)';
    }

    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return 'Phone number is compulsory and must be exactly 10 digits';
    }

    const email = data.email.trim();
    if (!email) {
      return 'Email address is compulsory!';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g. staff@grocerymart.com)';
    }

    if (!isEdit || (data.pin && data.pin.trim())) {
      const cleanPin = (data.pin || '').replace(/\D/g, '');
      if (cleanPin.length !== 4) {
        return 'Login PIN must be exactly 4 numeric digits';
      }
    }

    return null;
  };

  // KPI Calculations
  const totalStaffCount = staff.length;
  const onDutyCount = useMemo(() => {
    return staff.filter((m: any) => {
      const currentShift = m.shifts?.[0];
      return Boolean(currentShift?.clockIn && !currentShift?.clockOut);
    }).length;
  }, [staff]);

  const cashierCount = useMemo(() => {
    return staff.filter((m: any) => {
      const r = String(m.role || '').toUpperCase();
      return r === 'CASHIER' || r.includes('CASHIER');
    }).length;
  }, [staff]);

  const pickerRiderCount = useMemo(() => {
    return staff.filter((m: any) => {
      const r = String(m.role || '').toUpperCase();
      return r.includes('PICKER') || r.includes('DELIVERY') || r.includes('RIDER');
    }).length;
  }, [staff]);

  // Filtered staff directory
  const filteredStaff = useMemo(() => {
    return staff.filter((member: any) => {
      const matchesSearch =
        !searchTerm ||
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const memberRoleUpper = String(member.role || '').toUpperCase();
      const matchesRole = roleFilter === 'ALL' || memberRoleUpper.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [staff, searchTerm, roleFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateStaffInput(addForm, false);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    const cleanPhone = addForm.phone.replace(/\D/g, '');
    const cleanPin = addForm.pin.replace(/\D/g, '');

    createStaff.mutate(
      {
        storeId,
        payload: {
          name: addForm.name.trim(),
          phone: cleanPhone,
          email: addForm.email.trim(),
          role: addForm.role,
          pin: cleanPin,
          shift: addForm.shift,
        },
      },
      {
        onSuccess: () => {
          toast.success(`${addForm.name} registered as staff successfully!`);
          setActiveTab('directory');
          setAddForm({
            name: '',
            phone: '',
            email: '',
            role: 'CASHIER',
            pin: '',
            shift: 'Morning',
          });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create staff member');
        },
      }
    );
  };

  const handleOpenEdit = (member: any) => {
    setEditingStaff(member);

    let roleStr = 'CASHIER';
    if (typeof member.role === 'string') {
      roleStr = member.role;
    } else if (member.role && typeof member.role === 'object') {
      roleStr = member.role.roleName || member.role.name || member.role.role || 'CASHIER';
    }

    const upper = String(roleStr).toUpperCase().replace(/[-\s]+/g, '_');
    let rawRole = 'CASHIER';
    if (upper.includes('PICKER')) rawRole = 'PICKER';
    else if (upper.includes('DELIVERY') || upper.includes('RIDER')) rawRole = 'DELIVERY_PARTNER';
    else if (upper.includes('STORE_MANAGER') || upper.includes('MANAGER')) rawRole = 'STORE_MANAGER';
    else if (upper.includes('CASHIER')) rawRole = 'CASHIER';
    else rawRole = 'CASHIER';

    let shiftStr = member.shift || (member.shifts?.[0]?.shiftName ? member.shifts[0].shiftName : 'Morning');
    if (!shiftStr || shiftStr === 'General') shiftStr = 'Morning';

    const pinStr = member.pin ? String(member.pin) : '1234';

    const activeBool = member.isActive !== undefined
      ? Boolean(member.isActive)
      : (member.status === 'active' || member.status !== 'inactive');

    setEditForm({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      role: rawRole,
      shift: shiftStr,
      pin: pinStr,
      isActive: activeBool,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateStaffInput(editForm, true);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    updateStaff.mutate(
      {
        storeId,
        staffId: editingStaff.id,
        payload: {
          name: editForm.name.trim(),
          phone: editForm.phone.replace(/\D/g, ''),
          email: editForm.email.trim(),
          role: editForm.role,
          shift: editForm.shift,
          pin: editForm.pin ? editForm.pin.replace(/\D/g, '') : undefined,
          isActive: editForm.isActive,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Staff member ${editForm.name} updated successfully!`);
          setEditingStaff(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update staff member');
        },
      }
    );
  };

  const handleToggleClock = (staffMember: any) => {
    const isClockedIn = Boolean(staffMember.shifts?.[0]?.clockIn && !staffMember.shifts?.[0]?.clockOut);
    toggleClock.mutate(
      { storeId, staffId: staffMember.id },
      {
        onSuccess: () => {
          toast.success(`${staffMember.name} ${isClockedIn ? 'clocked out' : 'clocked in'}!`);
        },
        onError: () => {
          toast.error('Failed to update clock status');
        }
      }
    );
  };

  const handleShiftChange = (staffId: string, shift: string) => {
    updateShift.mutate(
      { storeId, staffId, shift },
      {
        onSuccess: () => {
          toast.success(`Shift updated to ${shift}!`);
        },
        onError: () => {
          toast.error('Failed to update shift');
        }
      }
    );
  };

  const getRoleLabel = (roleObj: any): string => {
    if (!roleObj) return 'Staff';
    let rawStr = 'Staff';
    if (typeof roleObj === 'string') {
      rawStr = roleObj;
    } else if (typeof roleObj === 'object') {
      rawStr = roleObj.roleName || roleObj.name || roleObj.role || 'Staff';
    }
    const upper = String(rawStr).toUpperCase().replace(/[-\s]+/g, '_');
    if (upper === 'CASHIER' || upper === 'POS_CASHIER') return 'POS Cashier';
    if (upper === 'PICKER' || upper === 'ORDER_PICKER') return 'Order Picker / Packer';
    if (upper === 'DELIVERY_PARTNER' || upper === 'DELIVERY_RIDER') return 'Delivery Partner';
    if (upper === 'STORE_MANAGER' || upper === 'ASSISTANT_STORE_MANAGER') return 'Store Manager';
    return rawStr;
  };

  const staffColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Staff Member',
      accessorKey: 'name',
      sortable: true,
      cell: (member) => {
        const initials = (member.name || 'Staff')
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
              <div className="font-bold text-sm text-foreground truncate">{member.name}</div>
              <Badge variant="outline" className="text-[9px] uppercase font-extrabold mt-0.5 border-primary-500/30 text-primary-600 dark:text-primary-400 bg-primary-500/5">
                {getRoleLabel(member.role)}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact Info',
      accessorKey: 'phone',
      cell: (member) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Smartphone className="h-3.5 w-3.5 shrink-0 text-primary-500" />
            <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
          </div>
          <div className="flex items-center gap-1.5 text-xs truncate">
            <Mail className="h-3.5 w-3.5 shrink-0 text-primary-500" />
            <a href={`mailto:${member.email}`} className="truncate hover:underline">
              {member.email || <span className="text-amber-500 italic">No email set</span>}
            </a>
          </div>
        </div>
      ),
    },
    {
      header: 'Login PIN',
      accessorKey: 'pin',
      cell: (member) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded tracking-widest">
          {member.pin ? member.pin : '1234'}
        </span>
      ),
    },
    {
      header: 'Assigned Shift',
      accessorKey: 'shift',
      sortable: true,
      cell: (member) => {
        const currentShift = member.shifts?.[0];
        const shiftName = currentShift?.shiftName ? currentShift.shiftName : (member.shift || 'Not Assigned');
        return (
          <span className="font-bold text-xs text-foreground bg-muted px-2.5 py-1 rounded">
            {shiftName}
          </span>
        );
      },
    },
    {
      header: 'Duty Status',
      accessorKey: 'status',
      sortable: true,
      cell: (member) => {
        const currentShift = member.shifts?.[0];
        const isClockedIn = Boolean(currentShift?.clockIn && !currentShift?.clockOut);
        return isClockedIn ? (
          <Badge variant="success" className="text-[10px] uppercase font-black px-2.5 py-0.5 inline-flex items-center gap-1 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            On Duty
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 text-muted-foreground bg-muted/40">
            Off Clock
          </Badge>
        );
      },
    },
    {
      header: 'Clock Control',
      cell: (member) => {
        const currentShift = member.shifts?.[0];
        const isClockedIn = Boolean(currentShift?.clockIn && !currentShift?.clockOut);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleClock(member);
            }}
            disabled={toggleClock.isPending}
            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors disabled:opacity-50"
            title="Toggle Clock In/Out"
          >
            {isClockedIn ? (
              <ToggleRight className="h-7 w-7 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-600" />
            )}
          </button>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (member) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(member);
            }}
            className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
            title="Edit Staff Member"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingStaff(member);
            }}
            className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Staff Account"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [toggleClock.isPending, storeId]);

  const shiftColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Staff Member',
      accessorKey: 'name',
      sortable: true,
      cell: (member) => {
        const initials = (member.name || 'Staff').split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs shrink-0 border border-primary-500/20">
              {initials}
            </div>
            <span className="font-bold text-sm text-foreground">{member.name}</span>
          </div>
        );
      },
    },
    {
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      cell: (member) => (
        <span className="font-semibold text-xs text-muted-foreground">{getRoleLabel(member.role)}</span>
      ),
    },
    {
      header: 'Assigned Shift Schedule',
      accessorKey: 'shift',
      sortable: true,
      cell: (member) => {
        const currentShift = member.shifts?.[0];
        const shiftName = currentShift?.shiftName ? currentShift.shiftName : (member.shift || '');
        return (
          <div className="w-[200px] relative">
            <CustomDropdown
              options={shiftRosterOptions}
              value={shiftName}
              onChange={(v) => handleShiftChange(member.id, v)}
              triggerClassName="h-[32px] !text-[11px] font-semibold"
            />
          </div>
        );
      },
    },
    {
      header: 'Duty Status',
      accessorKey: 'status',
      sortable: true,
      className: 'text-center',
      cell: (member) => {
        const currentShift = member.shifts?.[0];
        const isClockedIn = Boolean(currentShift?.clockIn && !currentShift?.clockOut);
        return isClockedIn ? (
          <Badge variant="success" className="text-[10px] font-black uppercase px-2.5 py-0.5">Active Clocked In</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground px-2 py-0.5">Logged Off</Badge>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (member) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(member);
            }}
            className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
            title="Edit Staff"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [storeId]);

  const performanceColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Staff Member',
      accessorKey: 'name',
      sortable: true,
      cell: (member) => {
        const initials = (member.name || 'Staff').split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs shrink-0 border border-primary-500/20">
              {initials}
            </div>
            <span className="font-bold text-sm text-foreground">{member.name}</span>
          </div>
        );
      },
    },
    {
      header: 'Position',
      accessorKey: 'role',
      sortable: true,
      cell: (member) => (
        <span className="font-semibold text-xs text-muted-foreground">{getRoleLabel(member.role)}</span>
      ),
    },
    {
      header: 'Total Shifts',
      accessorKey: 'totalShifts',
      sortable: true,
      className: 'text-center',
      cell: (member) => {
        const shiftsCount = member.performance?.totalShifts ?? (member.shifts?.length || 0);
        return (
          <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 px-2.5 py-1 rounded-md font-mono text-xs font-bold">
            {shiftsCount} {shiftsCount === 1 ? 'shift' : 'shifts'}
          </span>
        );
      },
    },
    {
      header: 'Processed Orders',
      accessorKey: 'ordersProcessed',
      sortable: true,
      className: 'text-center',
      cell: (member) => {
        const orderCount = member.performance?.ordersProcessed ?? 0;
        return (
          <span className="bg-muted px-2.5 py-1 rounded-md text-foreground font-mono text-xs font-bold">
            {orderCount} {orderCount === 1 ? 'order' : 'orders'}
          </span>
        );
      },
    },
    {
      header: 'Total Shift Revenue',
      accessorKey: 'totalRevenue',
      sortable: true,
      className: 'text-right',
      cell: (member) => {
        const revenue = member.performance?.totalRevenue ?? 0;
        return (
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded">
            ₹{Number(revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Users}
        title="Staff & Shift Management"
        subtitle="Manage store personnel, shifts, login PIN codes, and picker performance metrics"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-6">

        {/* ── KPI Summary Cards Grid (All using theme color bg-primary-500) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-page-enter">
          <CustomKpiCard
            title="Total Store Personnel"
            value={totalStaffCount}
            subtitle="Registered staff accounts"
            icon={<Users />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Clocked-In On Duty"
            value={onDutyCount}
            subtitle="Active personnel on floor"
            icon={<UserCheck />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="POS Cashiers"
            value={cashierCount}
            subtitle="Checkout counter operators"
            icon={<CreditCard />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Pickers & Delivery"
            value={pickerRiderCount}
            subtitle="Fulfillment & rider team"
            icon={<Truck />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
          {[
            { id: 'directory', name: 'Staff Directory', icon: Users },
            { id: 'add', name: 'Add Staff Member', icon: UserPlus },
            { id: 'shifts', name: 'Shift Roster', icon: Calendar },
            { id: 'performance', name: 'Performance KPIs', icon: TrendingUp }
          ].map((tab: { id: string; name: string; icon: any; count?: number }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[1px] transition-all relative whitespace-nowrap rounded-t-lg ${activeTab === tab.id
                ? 'border-primary-600 text-white bg-primary-600 dark:border-primary-500 dark:bg-primary-500 dark:text-white shadow-sm'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Contents ── */}

        {/* DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <div className="space-y-4 animate-page-enter">
            {/* Search and Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search staff by name, phone or email..."
                wrapperClassName="w-full sm:w-80"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Role:</span>
                <div className="w-48 relative">
                  <CustomDropdown
                    options={roleFilterOptions}
                    value={roleFilter}
                    onChange={(v) => setRoleFilter(v)}
                    triggerClassName="h-9 !text-xs font-semibold"
                  />
                </div>
                <Button size="sm" onClick={() => setActiveTab('add')} className="h-9 gap-1.5 font-bold ml-auto sm:ml-0">
                  <Plus className="h-4 w-4" /> Add Staff
                </Button>
              </div>
            </div>

            <DataTable
              data={filteredStaff}
              columns={staffColumns}
              isLoading={isLoading}
              searchable={false}
              itemsPerPage={10}
              emptyMessage={searchTerm || roleFilter !== 'ALL' ? 'No staff members found matching search criteria' : 'No staff members registered in system'}
            />
          </div>
        )}

        {/* ADD STAFF TAB */}
        {activeTab === 'add' && (
          <Card className="max-w-xl mx-auto animate-page-enter overflow-visible relative z-30 shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-500" />
                Register New Staff Account
              </CardTitle>
              <CardDescription>
                Create store-level credentials for cashiers, order pickers, or delivery partners. Email is compulsory.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 overflow-visible relative z-30">
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Full Name *</label>
                  <Input
                    placeholder="e.g. Ramesh Prasad"
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number (10 digits) *</label>
                    <Input
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      value={addForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setAddForm(prev => ({ ...prev, phone: val }));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Compulsory) *</label>
                    <Input
                      type="email"
                      placeholder="e.g. ramesh@grocerymart.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">
                  <div className="space-y-1 relative z-40">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Role Selection *</label>
                    <CustomDropdown
                      options={roleOptions}
                      value={addForm.role}
                      onChange={(v) => setAddForm(prev => ({ ...prev, role: v }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Login Secure PIN (4 Digits) *</label>
                    <Input
                      placeholder="e.g. 1234"
                      maxLength={4}
                      value={addForm.pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) setAddForm(prev => ({ ...prev, pin: val }));
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 relative z-30">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Default Work Shift *</label>
                  <CustomDropdown
                    options={shiftOptions}
                    value={addForm.shift}
                    onChange={(v) => setAddForm(prev => ({ ...prev, shift: v }))}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('directory')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" size="sm" disabled={createStaff.isPending} className="gap-1.5 font-bold">
                    {createStaff.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Register Staff Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* SHIFTS TAB */}
        {activeTab === 'shifts' && (
          <Card className="animate-page-enter overflow-visible relative z-30">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Shift Roster & Schedule Planner
              </CardTitle>
              <CardDescription>Assign and update daily work shift schedules for personnel.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-visible relative z-30">
              <DataTable
                data={staff}
                columns={shiftColumns}
                isLoading={isLoading}
                searchable={false}
                itemsPerPage={10}
                emptyMessage="No staff members exist in database to assign shifts."
              />
            </CardContent>
          </Card>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <Card className="animate-page-enter">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                Performance Dashboard & KPIs
              </CardTitle>
              <CardDescription>Live efficiency metrics including order volume, average handling time, and ratings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <DataTable
                data={staff}
                columns={performanceColumns}
                isLoading={isLoading}
                searchable={false}
                itemsPerPage={10}
                emptyMessage="No staff members exist in database to display performance metrics."
              />
            </CardContent>
          </Card>
        )}

      </div>

      {/* ── EDIT STAFF MODAL ── */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative z-50 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Edit Staff Member</h3>
                  <p className="text-xs text-muted-foreground">Update profile details, email, role, and shift settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Full Name *</label>
                <Input
                  placeholder="e.g. Ramesh Prasad"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number (10 digits) *</label>
                  <Input
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={editForm.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setEditForm(prev => ({ ...prev, phone: val }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Compulsory) *</label>
                  <Input
                    type="email"
                    placeholder="e.g. ramesh@grocerymart.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">
                <div className="space-y-1 relative z-40">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Role Selection *</label>
                  <CustomDropdown
                    options={roleOptions}
                    value={editForm.role}
                    onChange={(v) => setEditForm(prev => ({ ...prev, role: v }))}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1 relative z-10">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Login Secure PIN (4 Digits)</label>
                  <Input
                    placeholder="e.g. 1234"
                    maxLength={4}
                    value={editForm.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 4) setEditForm(prev => ({ ...prev, pin: val }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
                <div className="space-y-1 relative z-30">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Default Work Shift *</label>
                  <CustomDropdown
                    options={shiftOptions}
                    value={editForm.shift}
                    onChange={(v) => setEditForm(prev => ({ ...prev, shift: v }))}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 relative z-10 flex flex-col justify-end">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1">Account Active Status</label>
                  <div className="flex items-center gap-3 h-[38px] px-3 bg-muted/40 border border-border rounded-md">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="editIsActive" className="text-xs font-bold cursor-pointer select-none text-foreground">
                      {editForm.isActive ? 'Active Staff Account' : 'Disabled / Suspended'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStaff(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" disabled={updateStaff.isPending} className="gap-1.5 font-bold">
                  {updateStaff.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingStaff)}
        onClose={() => setDeletingStaff(null)}
        onConfirm={() => {
          if (!deletingStaff) return;
          deleteStaff.mutate(
            { storeId, staffId: deletingStaff.id },
            {
              onSuccess: () => {
                toast.success(`Staff member ${deletingStaff.name} deleted successfully!`);
                setDeletingStaff(null);
              },
              onError: (err: any) => {
                toast.error(err?.response?.data?.message || 'Failed to delete staff member');
              },
            }
          );
        }}
        title="Delete Staff Member"
        description="Are you sure you want to remove this staff member from your store? Access will be permanently revoked."
        itemName={deletingStaff?.name}
      />
    </div>
  );
}
