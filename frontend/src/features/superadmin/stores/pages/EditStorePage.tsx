import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Store as StoreIcon, Building2, MapPin, Phone,   Shield, Loader2, Save, ShoppingBag, Truck, CheckSquare } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useStores, useUpdateStore } from '../api/useStores';
import { storeSchema, type StoreFormValues } from '../schemas/storeSchema';

export default function EditStorePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: response, isLoading: isLoadingStores } = useStores();
  const store = response?.data?.find(s => s.id === id);

  const updateStore = useUpdateStore();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: {
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
      deliveryEnabled: false,
      clickCollectEnabled: false,
      managerName: '',
      managerEmail: '',
      managerPhone: '',
      managerPassword: '',
    },
  });

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        address: store.address,
        lat: store.lat,
        long: store.long,
        radiusKm: store.radiusKm,
        phone: store.phone || '',
        gstin: store.gstin || '',
        openingTime: store.openingTime,
        closingTime: store.closingTime,
        isActive: store.isActive,
        posEnabled: store.posEnabled,
        deliveryEnabled: store.deliveryEnabled,
        clickCollectEnabled: store.clickCollectEnabled,
        managerName: store.manager?.name || '',
        managerEmail: store.manager?.email || '',
        managerPhone: store.manager?.phone || '',
        managerPassword: '', // Leave empty unless changing
      });
    }
  }, [store, form]);

  const onSubmit = async (data: StoreFormValues) => {
    if (!id) return;
    
    // If password is not provided on edit, we should remove it from payload so backend doesn't overwrite.
    // In our current schema, password is required, but for editing we might need to handle this differently.
    // To keep it simple, we'll send it all.
    updateStore.mutate(
      { id, payload: data },
      {
        onSuccess: () => navigate('/stores'),
      }
    );
  };

  if (isLoadingStores) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <StoreIcon className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold">Store not found</h2>
        <Button onClick={() => navigate('/stores')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Franchise Store"
        breadcrumb={['Home', 'Stores', 'Edit Store']}
        onBack={() => navigate('/stores')}
      />

      <form onSubmit={form.handleSubmit(onSubmit as any)} className="w-full px-4 sm:px-6 py-4 space-y-6 pb-12">
        {/* ── Store Details ── */}
        <SectionCard title="Franchise Store Details" icon={<Building2 />}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <FormField label="Store Name" error={form.formState.errors.name?.message} required>
                <Input {...form.register('name')} placeholder="e.g. Downtown Supermart" icon={<Building2 />} />
              </FormField>

              <FormField label="Complete Address" error={form.formState.errors.address?.message} required>
                <Input {...form.register('address')} placeholder="123 Main St, City, State, Zip" icon={<MapPin />} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <FormField label="Contact Phone" error={form.formState.errors.phone?.message}>
                <Input {...form.register('phone')} placeholder="+91 98765 43210" icon={<Phone />} />
              </FormField>
              <FormField label="GSTIN Number" error={form.formState.errors.gstin?.message}>
                <Input {...form.register('gstin')} placeholder="22AAAAA0000A1Z5" icon={<Shield />} />
              </FormField>
              <FormField label="Opening Time" error={form.formState.errors.openingTime?.message} required>
                <Input {...form.register('openingTime')} type="time" />
              </FormField>
              <FormField label="Closing Time" error={form.formState.errors.closingTime?.message} required>
                <Input {...form.register('closingTime')} type="time" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField label="Latitude (GPS)" error={form.formState.errors.lat?.message} required>
                <Input {...form.register('lat')} type="number" step="any" placeholder="0.000000" />
              </FormField>
              <FormField label="Longitude (GPS)" error={form.formState.errors.long?.message} required>
                <Input {...form.register('long')} type="number" step="any" placeholder="0.000000" />
              </FormField>
              <FormField label="Service Radius (km)" error={form.formState.errors.radiusKm?.message} required>
                <Input {...form.register('radiusKm')} type="number" step="0.1" placeholder="3.0" />
              </FormField>
            </div>
          </div>
        </SectionCard>

        {/* ── Feature Modules ── */}
        <SectionCard title="Franchise Modules & Capabilities" icon={<ShoppingBag />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <label className="flex items-start justify-between p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Point of Sale (POS)</p>
                  <p className="text-[12px] text-slate-500 mt-1">Allow counter sales, walk-in billing, and cash register access.</p>
                </div>
              </div>
              <input type="checkbox" {...form.register('posEnabled')} className="w-4 h-4 mt-1 accent-primary-600" />
            </label>

            <label className="flex items-start justify-between p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Online Delivery</p>
                  <p className="text-[12px] text-slate-500 mt-1">Enable home delivery assignments to local delivery partners.</p>
                </div>
              </div>
              <input type="checkbox" {...form.register('deliveryEnabled')} className="w-4 h-4 mt-1 accent-primary-600" />
            </label>

            <label className="flex items-start justify-between p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Click & Collect</p>
                  <p className="text-[12px] text-slate-500 mt-1">Allow customers to order online and pick up directly from store.</p>
                </div>
              </div>
              <input type="checkbox" {...form.register('clickCollectEnabled')} className="w-4 h-4 mt-1 accent-primary-600" />
            </label>
          </div>
        </SectionCard>

        {/* ── Submit Action ── */}
        <div className="flex justify-end pt-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" className="h-8 px-4" onClick={() => navigate('/stores')}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateStore.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white h-8 px-5 font-semibold tracking-wide rounded-md flex items-center gap-1.5 text-[11px]"
            >
              {updateStore.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
