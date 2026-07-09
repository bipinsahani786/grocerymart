import { useState, type FormEvent } from 'react';
import { Building2, Clock, MapPin, Plus, Store as StoreIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';
import { useCreateStore, useStores, type CreateStorePayload } from '../api/useStores';

const defaultForm: CreateStorePayload = {
  name: '',
  address: '',
  lat: 0,
  long: 0,
  radiusKm: 3,
  phone: '',
  gstin: '',
  openingTime: '08:00',
  closingTime: '22:00',
  isActive: true,
  posEnabled: true,
  deliveryEnabled: true,
  clickCollectEnabled: true,
};

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-input-bg px-4 py-3 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary-500"
      />
    </label>
  );
}

export default function StoreDashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStorePayload>(defaultForm);
  const { data: stores = [], isLoading } = useStores();
  const createStore = useCreateStore();

  const updateForm = <K extends keyof CreateStorePayload>(key: K, value: CreateStorePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createStore.mutate(form, {
      onSuccess: () => {
        setForm(defaultForm);
        setShowForm(false);
      },
    });
  };

  if (isLoading) return <PageLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        icon={StoreIcon}
        title="Store Dashboard"
        subtitle="Create stores and monitor store-level operating status"
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Stores</p>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stores.length}</h2>
          </div>
          <Button size="sm" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            Create Store
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Store</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Input
                  required
                  placeholder="Store name"
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  icon={<Building2 className="h-4 w-4" />}
                />
                <Input
                  required
                  placeholder="Address"
                  value={form.address}
                  onChange={(event) => updateForm('address', event.target.value)}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(event) => updateForm('phone', event.target.value)}
                />
                <Input
                  placeholder="GSTIN"
                  value={form.gstin}
                  onChange={(event) => updateForm('gstin', event.target.value)}
                />
                <Input
                  required
                  type="number"
                  step="0.000001"
                  placeholder="Latitude"
                  value={form.lat}
                  onChange={(event) => updateForm('lat', Number(event.target.value))}
                />
                <Input
                  required
                  type="number"
                  step="0.000001"
                  placeholder="Longitude"
                  value={form.long}
                  onChange={(event) => updateForm('long', Number(event.target.value))}
                />
                <Input
                  required
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Radius KM"
                  value={form.radiusKm}
                  onChange={(event) => updateForm('radiusKm', Number(event.target.value))}
                />
                <Input
                  required
                  type="time"
                  value={form.openingTime}
                  onChange={(event) => updateForm('openingTime', event.target.value)}
                  icon={<Clock className="h-4 w-4" />}
                />
                <Input
                  required
                  type="time"
                  value={form.closingTime}
                  onChange={(event) => updateForm('closingTime', event.target.value)}
                  icon={<Clock className="h-4 w-4" />}
                />
                <ToggleField label="Store Active" checked={form.isActive} onChange={(checked) => updateForm('isActive', checked)} />
                <ToggleField label="POS Enabled" checked={form.posEnabled} onChange={(checked) => updateForm('posEnabled', checked)} />
                <ToggleField label="Delivery Enabled" checked={form.deliveryEnabled} onChange={(checked) => updateForm('deliveryEnabled', checked)} />
                <ToggleField label="Click & Collect" checked={form.clickCollectEnabled} onChange={(checked) => updateForm('clickCollectEnabled', checked)} />
                <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" isLoading={createStore.isPending} loadingText="Creating">
                    Create Store
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {stores.map((store) => (
            <Card key={store.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{store.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{store.address}</p>
                  </div>
                  <Badge variant={store.isActive ? 'success' : 'secondary'}>{store.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs">
                  <div>
                    <p className="font-bold text-muted-foreground uppercase">Manager</p>
                    <p className="font-semibold truncate mt-1">{store.manager?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-muted-foreground uppercase">Hours</p>
                    <p className="font-semibold mt-1">{store.openingTime} - {store.closingTime}</p>
                  </div>
                  <div>
                    <p className="font-bold text-muted-foreground uppercase">Radius</p>
                    <p className="font-semibold mt-1">{store.radiusKm} km</p>
                  </div>
                  <div>
                    <p className="font-bold text-muted-foreground uppercase">Users</p>
                    <p className="font-semibold mt-1">{store._count?.users ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stores.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-sm font-semibold text-muted-foreground">
              No stores created yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
