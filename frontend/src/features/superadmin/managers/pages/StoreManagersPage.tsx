import { useState, type FormEvent, useMemo } from 'react';
import { Mail, Phone, Plus, User, Lock, Power, Users, Edit, UserCheck, UserX, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { useStores } from '../../stores/api/useStores';
import { useCreateManager, useManagers, useUpdateManagerStatus, useUpdateManagerPassword, useUpdateManagerProfile, useDeleteManager, type CreateManagerPayload, type StoreManager } from '../api/useManagers';
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

  const [editingManager, setEditingManager] = useState<StoreManager | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateManagerPayload>>({});
  const [managerToDelete, setManagerToDelete] = useState<StoreManager | null>(null);

  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; managerId: string; managerName: string }>({ isOpen: false, managerId: '', managerName: '' });
  const [newPassword, setNewPassword] = useState('');

  const { data: managers = [], isLoading: managersLoading } = useManagers();
  const { data: storesResponse, isLoading: storesLoading } = useStores();
  const stores = storesResponse?.data || [];
  const createManager = useCreateManager();
  const updateStatus = useUpdateManagerStatus();
  const updatePassword = useUpdateManagerPassword();
  const updateProfile = useUpdateManagerProfile();
  const deleteManager = useDeleteManager();

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
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Manager"
              onClick={(e) => {
                e.stopPropagation();
                setManagerToDelete(manager);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
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
            subtitle="Active manager accounts"
            icon={<UserCheck className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Suspended Accounts"
            value={managers.filter(m => m.status === 'suspended' || m.status === 'banned').length}
            subtitle="Access restricted"
            icon={<UserX className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Assigned Outlets"
            value={managers.filter(m => m.managedStore || m.store).length}
            subtitle="Linked franchise stores"
            icon={<Building2 className="w-5 h-5" />}
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

      {/* ── Confirm Delete Store Manager Modal (Direct Confirm / Cancel) ── */}
      <DeleteConfirmModal
        isOpen={!!managerToDelete}
        onClose={() => setManagerToDelete(null)}
        onConfirm={() => {
          if (managerToDelete) {
            deleteManager.mutate(managerToDelete.id);
          }
        }}
        title="Delete Store Manager"
        description="Are you sure you want to delete this store manager account? This action cannot be undone."
        itemName={managerToDelete?.name || managerToDelete?.email || 'Store Manager'}
      />
    </div>
  );
}
