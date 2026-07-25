import { useState, type FormEvent, useMemo } from 'react';
import { Mail, Phone, Plus, Store, User, Lock, Power, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useStores } from '../../stores/api/useStores';
import { useCreateManager, useManagers, useUpdateManagerStatus, useUpdateManagerPassword, type CreateManagerPayload, type StoreManager } from '../api/useManagers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; managerId: string; managerName: string }>({ isOpen: false, managerId: '', managerName: '' });
  const [newPassword, setNewPassword] = useState('');

  const { data: managers = [], isLoading: managersLoading } = useManagers();
  const { data: storesResponse, isLoading: storesLoading } = useStores();
  const stores = storesResponse?.data || [];
  const createManager = useCreateManager();
  const updateStatus = useUpdateManagerStatus();
  const updatePassword = useUpdateManagerPassword();

  const updateForm = <K extends keyof CreateManagerPayload>(key: K, value: CreateManagerPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 text-foreground pb-12">
      <PageHeader
        title="Store Managers"
        breadcrumb={['Home', 'Stores', 'Managers']}
        actions={
          <Button size="sm" onClick={() => setShowForm((value) => !value)} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm h-8 px-3 text-[11px] font-semibold tracking-wide">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Manager
          </Button>
        }
      />

      <div className="w-full px-4 sm:px-6 py-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Managers"
            value={managers.length}
            subtitle="Registered store managers"
            icon={<Users />}
            color="bg-primary-50/70 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400"
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

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
          <DataTable
            columns={columns}
            data={managers}
            searchPlaceholder="Search managers by name or email..."
            searchKey="name"
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
