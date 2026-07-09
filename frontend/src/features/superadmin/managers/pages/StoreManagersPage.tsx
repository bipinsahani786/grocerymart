import { useState, type FormEvent } from 'react';
import { Mail, Phone, Plus, ShieldCheck, Store, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';
import { useStores } from '../../stores/api/useStores';
import { useCreateManager, useManagers, type CreateManagerPayload } from '../api/useManagers';

const defaultForm: CreateManagerPayload = {
  name: '',
  email: '',
  phone: '',
  password: '',
  storeId: null,
};

export default function StoreManagersPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateManagerPayload>(defaultForm);
  const { data: managers = [], isLoading: managersLoading } = useManagers();
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const createManager = useCreateManager();

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

  if (managersLoading || storesLoading) return <PageLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        icon={ShieldCheck}
        title="Store Managers"
        subtitle="Create manager accounts and assign them to stores"
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Managers</p>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{managers.length}</h2>
          </div>
          <Button size="sm" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            Create Manager
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Store Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <Select
                  value={form.storeId || ''}
                  onChange={(event) => updateForm('storeId', event.target.value || null)}
                  icon={<Store className="h-4 w-4" />}
                >
                  <option value="">Assign store later</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </Select>
                <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" isLoading={createManager.isPending} loadingText="Creating">
                    Create Manager
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {managers.map((manager) => {
            const assignedStore = manager.managedStore || manager.store;
            return (
              <Card key={manager.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{manager.name || 'Unnamed Manager'}</h3>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{manager.email}</p>
                    </div>
                    <Badge variant={manager.status === 'active' ? 'success' : 'warning'}>{manager.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs">
                    <div>
                      <p className="font-bold text-muted-foreground uppercase">Phone</p>
                      <p className="font-semibold truncate mt-1">{manager.phone || 'Not added'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground uppercase">Store</p>
                      <p className="font-semibold truncate mt-1">{assignedStore?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground uppercase">Role</p>
                      <p className="font-semibold truncate mt-1">{manager.role?.roleName || 'store_manager'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {managers.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-sm font-semibold text-muted-foreground">
              No store managers created yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
