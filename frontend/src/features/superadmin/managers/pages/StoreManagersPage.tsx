import { useState, type FormEvent, useMemo } from 'react';
import { Mail, Phone, Plus, Store, User, Lock, Power, Users, Edit, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useStores } from '../../stores/api/useStores';
import { useCreateManager, useManagers, useUpdateManagerStatus, useUpdateManagerPassword, useUpdateManagerProfile, type CreateManagerPayload, type StoreManager } from '../api/useManagers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import React from 'react';

function CustomKpiCard({ title, value, subtitle, icon, colorClass = "bg-primary-500", iconColorClass = "text-white bg-white/20" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass?: string;
  iconColorClass?: string;
}) {
  return (
    <div className={`transition-all duration-300 relative overflow-hidden rounded-md shadow-sm hover:shadow-md border border-white/10 p-3 sm:p-4 flex flex-col justify-between min-h-[85px] w-full text-white group ${colorClass}`}>
      {/* Decorative Background Shapes */}
      <div className="absolute right-2 top-2 w-16 h-16 bg-white/20 rotate-45 rounded-xl mix-blend-overlay pointer-events-none group-hover:bg-white/30 transition-all duration-500"></div>
      <div className="absolute -left-4 bottom-0 w-20 h-20 bg-black/10 rounded-full mix-blend-overlay pointer-events-none group-hover:bg-black/20 transition-all duration-500"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[2px] border-white/10 rounded-none mix-blend-overlay opacity-30 pointer-events-none rotate-12 scale-150"></div>

      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80 select-none truncate block">
              {title}
            </span>
            <div className="flex items-baseline min-w-0 mt-0.5">
              <span className="text-lg sm:text-xl font-black tracking-tight font-display truncate block w-full text-white drop-shadow-sm" title={value.toString()}>
                {value}
              </span>
            </div>
          </div>
          <div className={`p-2 rounded flex items-center justify-center shrink-0 transition-colors backdrop-blur-sm shadow-sm ${iconColorClass}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' }) : icon}
          </div>
        </div>

        {subtitle && (
          <div className="mt-auto min-w-0 pt-1.5 border-t border-white/20">
            <span className="text-[8px] sm:text-[9px] font-semibold text-white/70 block truncate" title={subtitle}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultForm: CreateManagerPayload = {
  name: '',
  email: '',
  phone: '',
  password: '',
  storeId: null,
};

export default function StoreManagersPage() {
  const [showForm, setShowForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [form, setForm] = useState<CreateManagerPayload>(defaultForm);

  const [editingManager, setEditingManager] = useState<StoreManager | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateManagerPayload>>({});

  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; managerId: string; managerName: string }>({ isOpen: false, managerId: '', managerName: '' });
  const [newPassword, setNewPassword] = useState('');

  const { data: managers = [], isLoading: managersLoading } = useManagers();
  const { data: storesResponse, isLoading: storesLoading } = useStores();
  const stores = storesResponse?.data || [];
  const createManager = useCreateManager();
  const updateStatus = useUpdateManagerStatus();
  const updatePassword = useUpdateManagerPassword();
  const updateProfile = useUpdateManagerProfile();

  const updateForm = <K extends keyof CreateManagerPayload>(key: K, value: CreateManagerPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditForm = <K extends keyof CreateManagerPayload>(key: K, value: CreateManagerPayload[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createManager.mutate(form, {
      onSuccess: () => {
        setForm(defaultForm);
        setShowForm(false);
      },
    });
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingManager) return;
    updateProfile.mutate({ id: editingManager.id, payload: editForm }, {
      onSuccess: () => {
        setEditingManager(null);
        setEditForm({});
      },
    });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    updatePassword.mutate({ id: passwordModal.managerId, password: newPassword }, {
      onSuccess: () => {
        setPasswordModal({ isOpen: false, managerId: '', managerName: '' });
        setNewPassword('');
      }
    });
  };

  const columns: ColumnDef<StoreManager>[] = useMemo(() => [
    {
      header: 'Manager Info',
      accessorKey: 'name',
      cell: (manager) => (
        <div className="py-0.5">
          <p className="font-bold text-[13px] text-slate-900 dark:text-slate-100 leading-tight">{manager.name || 'Unnamed Manager'}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <Mail className="w-2.5 h-2.5" />
            <span className="truncate max-w-[150px]">{manager.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (manager) => (
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">
          {manager.phone || '-'}
        </span>
      ),
    },
    {
      header: 'Assigned Store',
      cell: (manager) => {
        const assignedStore = manager.managedStore || manager.store;
        return (
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            {assignedStore?.name || 'Unassigned'}
          </span>
        );
      },
    },
    {
      header: 'Role',
      cell: (manager) => (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
          {manager.role?.roleName || 'store_manager'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: (manager) => (
        <Badge variant={manager.status === 'active' ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
          {manager.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (manager) => {
        const isActive = manager.status === 'active';
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50"
              title="Edit Manager"
              onClick={(e) => {
                e.stopPropagation();
                setEditingManager(manager);
                setEditForm({
                  name: manager.name || '',
                  email: manager.email || '',
                  phone: manager.phone || '',
                  storeId: manager.managedStore?.id || manager.store?.id || null,
                });
              }}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50"
              title={isActive ? "Suspend Manager" : "Activate Manager"}
              onClick={(e) => {
                e.stopPropagation();
                updateStatus.mutate({ id: manager.id, status: isActive ? 'suspended' : 'active' });
              }}
            >
              <Power className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-emerald-500'}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50"
              title="Change Password"
              onClick={(e) => {
                e.stopPropagation();
                setPasswordModal({ isOpen: true, managerId: manager.id, managerName: manager.name || 'Unnamed' });
              }}
            >
              <Lock className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ], [updateStatus]);

  if (managersLoading || storesLoading) return <PageLoadingSkeleton />;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-200 pb-12">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-4">


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <CustomKpiCard
            title="Total Managers"
            value={managers.length}
            subtitle="Registered store managers"
            icon={<Users className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Active Managers"
            value={managers.filter(m => m.status === 'active').length}
            icon={<UserCheck className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Suspended Managers"
            value={managers.filter(m => m.status === 'suspended' || m.status === 'banned').length}
            icon={<UserX className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={
            <div className="flex items-center gap-2">
              <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-500 p-1.5 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-bold">Create Store Manager</span>
            </div>
          }
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              required
              placeholder="Manager name"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => updateForm('phone', event.target.value)}
              icon={<Phone className="h-4 w-4" />}
            />
            <Input
              required
              type="password"
              placeholder="Temporary password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
            />
            <div className={cn("sm:col-span-2 transition-all duration-300", isDropdownOpen ? "pb-60" : "pb-0")}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign Store
              </label>
              <SearchableSelect
                value={form.storeId || ''}
                onChange={(val) => updateForm('storeId', val === '' ? null : String(val))}
                onOpenChange={setIsDropdownOpen}
                options={[
                  { label: 'Assign store later', value: '' },
                  ...stores.map(store => ({ label: store.name, value: store.id }))
                ]}
                placeholder="Search and select a store..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="h-8 text-[12px]">Cancel</Button>
              <Button type="submit" size="sm" isLoading={createManager.isPending} loadingText="Creating" className="h-8 text-[12px] bg-primary-600 hover:bg-primary-700 text-white">
                Create Manager
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Manager Modal */}
        <Modal
          isOpen={!!editingManager}
          onClose={() => {
            setEditingManager(null);
            setEditForm({});
          }}
          title={
            <div className="flex items-center gap-2">
              <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-500 p-1.5 rounded-lg">
                <Edit className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-bold">Edit Store Manager</span>
            </div>
          }
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              required
              placeholder="Manager name"
              value={editForm.name || ''}
              onChange={(event) => updateEditForm('name', event.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={editForm.email || ''}
              onChange={(event) => updateEditForm('email', event.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              placeholder="Phone"
              value={editForm.phone || ''}
              onChange={(event) => updateEditForm('phone', event.target.value)}
              icon={<Phone className="h-4 w-4" />}
            />

            <div className={cn("sm:col-span-2 transition-all duration-300", isDropdownOpen ? "pb-60" : "pb-0")}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign Store
              </label>
              <SearchableSelect
                value={editForm.storeId || ''}
                onChange={(val) => updateEditForm('storeId', val === '' ? null : String(val))}
                onOpenChange={setIsDropdownOpen}
                options={[
                  { label: 'Unassigned', value: '' },
                  ...stores.map(store => ({ label: store.name, value: store.id }))
                ]}
                placeholder="Search and select a store..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditingManager(null); setEditForm({}); }} className="h-8 text-[12px]">Cancel</Button>
              <Button type="submit" size="sm" isLoading={updateProfile.isPending} loadingText="Saving" className="h-8 text-[12px] bg-primary-600 hover:bg-primary-700 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
          <DataTable
            columns={columns}
            data={managers}
            searchPlaceholder="Search managers by name or email..."
            searchKeys={['name', 'email', 'phone']}
            searchable={true}
            headerActions={
              <Button size="sm" onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm h-9 px-4 text-xs font-bold tracking-wide rounded-md transition-colors shrink-0">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Manager
              </Button>
            }
          />
        </div>
      </div>

      <Modal
        isOpen={passwordModal.isOpen}
        onClose={() => {
          setPasswordModal({ isOpen: false, managerId: '', managerName: '' });
          setNewPassword('');
        }}
        title={<span className="text-[15px] font-bold">Change Password for {passwordModal.managerName}</span>}
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            required
            type="password"
            placeholder="New Password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPasswordModal({ isOpen: false, managerId: '', managerName: '' });
                setNewPassword('');
              }}
              className="h-8 text-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={updatePassword.isPending}
              loadingText="Updating..."
              className="h-8 text-[12px] bg-primary-600 hover:bg-primary-700 text-white"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
