import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  Loader2,
  Save,
  ShoppingBag,
  Truck,
  CheckSquare,
  Store as StoreIcon,
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  KeyRound,
  Compass,
  ArrowLeft,
} from 'lucide-react';

import { SectionCard } from '@/components/ui/section-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomTimePicker } from '@/components/ui/custom-time-picker';
import { StoreCardPreview } from '@/components/ui/store-card-preview';

import { toast } from 'sonner';

import { useStores, useUpdateStore, getStoreSlug } from '../api/useStores';
import { storeSchema, type StoreFormValues } from '../schemas/storeSchema';

export default function EditStorePage() {
  const navigate = useNavigate();
  const { slugOrId } = useParams();
  const [geoLocating, setGeoLocating] = useState(false);

  const { data: response, isLoading: isLoadingStores } = useStores();
  const updateStore = useUpdateStore();

  // Find store by raw ID or URL slug
  const store = useMemo(() => {
    if (!response?.data || !slugOrId) return undefined;
    return response.data.find(
      (s) =>
        s.id === slugOrId ||
        getStoreSlug(s) === slugOrId ||
        s.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') === slugOrId
    );
  }, [response, slugOrId]);

  // Hide raw UUID from browser URL address bar by replacing with clean store name slug
  useEffect(() => {
    if (store && slugOrId === store.id) {
      const cleanSlug = getStoreSlug(store);
      if (cleanSlug && cleanSlug !== store.id) {
        navigate(`/stores/edit/${cleanSlug}`, { replace: true });
      }
    }
  }, [store, slugOrId, navigate]);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: {
      name: '',
      address: '',
      lat: '' as any,
      long: '' as any,
      radiusKm: '' as any,
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

  const watchAll = form.watch();

  // Populate form values when store data is loaded
  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name || '',
        address: store.address || '',
        lat: store.lat ? store.lat : ('' as any),
        long: store.long ? store.long : ('' as any),
        radiusKm: store.radiusKm ? store.radiusKm : ('' as any),
        phone: store.phone || '',
        gstin: store.gstin || '',
        openingTime: store.openingTime || '08:00',
        closingTime: store.closingTime || '22:00',
        isActive: store.isActive ?? true,
        posEnabled: store.posEnabled ?? true,
        deliveryEnabled: store.deliveryEnabled ?? false,
        clickCollectEnabled: store.clickCollectEnabled ?? false,
        managerName: store.manager?.name || '',
        managerEmail: store.manager?.email || '',
        managerPhone: store.manager?.phone || '',
        managerPassword: '', // Left blank unless user enters a new password
      });
    }
  }, [store, form]);

  // Calculate setup completion percentage
  const completionProgress = useMemo(() => {
    const fields: (keyof StoreFormValues)[] = [
      'name',
      'address',
      'phone',
      'gstin',
      'lat',
      'long',
      'radiusKm',
      'openingTime',
      'closingTime',
    ];
    let filled = 0;
    fields.forEach((f) => {
      const val = watchAll[f];
      if (val !== undefined && val !== '' && val !== 0) {
        filled += 1;
      }
    });

    const hasModule = watchAll.posEnabled || watchAll.deliveryEnabled || watchAll.clickCollectEnabled;
    const baseProgress = Math.round((filled / fields.length) * 90);
    return hasModule ? baseProgress + 10 : baseProgress;
  }, [watchAll]);

  // Geolocation trigger
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('lat', parseFloat(position.coords.latitude.toFixed(6)));
          form.setValue('long', parseFloat(position.coords.longitude.toFixed(6)));
          setGeoLocating(false);
          toast.success('GPS Location Detected');
        },
        () => {
          setGeoLocating(false);
          toast.error('Unable to retrieve current GPS coordinates');
        }
      );
    }
  };

  const onSubmit = async (data: StoreFormValues) => {
    if (!store?.id) return;

    if (!data.lat || Number(data.lat) === 0) {
      toast.error('GPS Latitude is compulsory and cannot be empty!');
      return;
    }
    if (!data.long || Number(data.long) === 0) {
      toast.error('GPS Longitude is compulsory and cannot be empty!');
      return;
    }
    if (!data.radiusKm || Number(data.radiusKm) <= 0) {
      toast.error('Service Radius (km) is compulsory and cannot be empty!');
      return;
    }
    if (!data.posEnabled && !data.deliveryEnabled && !data.clickCollectEnabled) {
      toast.error('At least one franchise module (POS, Delivery, or Click & Collect) must be enabled!');
      return;
    }

    const cleanedData: StoreFormValues = {
      ...data,
      lat: Math.abs(Number(data.lat)),
      long: Math.abs(Number(data.long)),
      radiusKm: Math.abs(Number(data.radiusKm)),
    };

    updateStore.mutate(
      { id: store.id, payload: cleanedData },
      {
        onSuccess: () => {
          toast.success('Store specifications updated successfully!');
          navigate('/stores');
        },
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
        <StoreIcon className="w-16 h-16 text-slate-300 dark:text-slate-700" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Store Not Found</h2>
        <p className="text-xs text-slate-500">The requested franchise store could not be located.</p>
        <Button onClick={() => navigate('/stores')}>Back to Stores List</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Top Header Bar (Unified Page Title & Actions) ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stores')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Stores"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Edit Franchise Store: <span className="text-primary-600 dark:text-primary-400">{store.name}</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update store location, operating hours, assigned manager credentials, and enabled capability modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => {
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
                    managerPassword: '',
                  });
                  toast.info('Form reset to saved store values');
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Changes
            </Button>
          </div>
        </div>

        {/* ── Setup Progress Banner ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Franchise Profile Completion
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {completionProgress}% Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updating specifications for store location, GPS coordinates, and active capability modules.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionProgress}%` }}
            />
          </div>
        </div>

        {/* ── Main Form Grid ── */}
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Form Sections (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* ── Section 1: Store & Entity Identity ── */}
            <SectionCard title="1. Store Identity & Contact Details" icon={<Building2 className="text-primary-500 dark:text-primary-400" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Store Name" error={form.formState.errors.name?.message} required>
                    <Input
                      {...form.register('name')}
                      placeholder="e.g. Downtown Supermart #42"
                      icon={<Building2 className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>

                  <FormField label="GSTIN Identification" error={form.formState.errors.gstin?.message} required>
                    <Input
                      {...form.register('gstin')}
                      placeholder="22AAAAA0000A1Z5"
                      icon={<Shield className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>
                </div>

                <FormField label="Complete Registered Address" error={form.formState.errors.address?.message} required>
                  <Input
                    {...form.register('address')}
                    placeholder="Plot 101, Retail Hub, Sector 62, City, State, Zip"
                    icon={<MapPin className="text-primary-500 dark:text-primary-400" />}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Store Contact Phone (10 Digits)" error={form.formState.errors.phone?.message} required>
                    <Input
                      {...form.register('phone')}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      icon={<Phone className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Opening Hours" error={form.formState.errors.openingTime?.message} required>
                      <Controller
                        control={form.control}
                        name="openingTime"
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Opening Time"
                          />
                        )}
                      />
                    </FormField>

                    <FormField label="Closing Hours" error={form.formState.errors.closingTime?.message} required>
                      <Controller
                        control={form.control}
                        name="closingTime"
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Closing Time"
                          />
                        )}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Section 2: GPS Coordinates & Coverage Radius ── */}
            <SectionCard
              title="2. Geolocation & Coverage Radius"
              icon={<Compass className="text-primary-500 dark:text-primary-400" />}
              headerRight={
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={geoLocating}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  {geoLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  Detect GPS
                </button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Latitude (GPS)" error={form.formState.errors.lat?.message as string | undefined} required>
                  <Input
                    {...form.register('lat')}
                    type="number"
                    step="any"
                    min={0}
                    allowNegative={false}
                    placeholder="e.g. 28.6139"
                  />
                </FormField>

                <FormField label="Longitude (GPS)" error={form.formState.errors.long?.message as string | undefined} required>
                  <Input
                    {...form.register('long')}
                    type="number"
                    step="any"
                    min={0}
                    allowNegative={false}
                    placeholder="e.g. 77.2090"
                  />
                </FormField>

                <FormField label="Service Radius (km)" error={form.formState.errors.radiusKm?.message as string | undefined} required>
                  <Input
                    {...form.register('radiusKm')}
                    type="number"
                    step="0.1"
                    min={0.1}
                    allowNegative={false}
                    placeholder="e.g. 3.0"
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* ── Section 3: Manager Credentials ── */}
            <SectionCard title="3. Store Manager Account Credentials" icon={<User className="text-primary-500 dark:text-primary-400" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Manager Full Name" error={form.formState.errors.managerName?.message}>
                    <Input
                      {...form.register('managerName')}
                      placeholder="Manager Name"
                      icon={<User className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>

                  <FormField label="Manager Phone (10 Digits)" error={form.formState.errors.managerPhone?.message}>
                    <Input
                      {...form.register('managerPhone')}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      icon={<Phone className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Work Email Address" error={form.formState.errors.managerEmail?.message}>
                    <Input
                      {...form.register('managerEmail')}
                      type="email"
                      placeholder="manager@store.com"
                      icon={<Mail className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>

                  <FormField label="New Account Password (Optional)" error={form.formState.errors.managerPassword?.message}>
                    <Input
                      {...form.register('managerPassword')}
                      type="password"
                      placeholder="Leave blank to keep current password"
                      icon={<KeyRound className="text-primary-500 dark:text-primary-400" />}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>

            {/* ── Section 4: Franchise Modules ── */}
            <SectionCard
              title={
                <span className="flex items-center gap-2">
                  <span>4. Enabled Franchise Modules</span>
                  <span className="text-rose-500 font-bold">* (At least 1 Required)</span>
                </span>
              }
              icon={<ShoppingBag className="text-primary-500 dark:text-primary-400" />}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* POS Card */}
                  <label className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${watchAll.posEnabled
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                        <StoreIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="checkbox"
                        {...form.register('posEnabled')}
                        className="w-4 h-4 accent-primary-600 cursor-pointer"
                      />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Point of Sale (POS)</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Counter billing, walk-in sales, and cash register terminal.
                      </p>
                    </div>
                  </label>

                  {/* Delivery Card */}
                  <label className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${watchAll.deliveryEnabled
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <input
                        type="checkbox"
                        {...form.register('deliveryEnabled')}
                        className="w-4 h-4 accent-primary-600 cursor-pointer"
                      />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Online Delivery</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Home delivery order dispatch and driver assignments.
                      </p>
                    </div>
                  </label>

                  {/* Pickup Card */}
                  <label className={`flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${watchAll.clickCollectEnabled
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <input
                        type="checkbox"
                        {...form.register('clickCollectEnabled')}
                        className="w-4 h-4 accent-primary-600 cursor-pointer"
                      />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Click & Collect</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Online order placement with self-in-store collection.
                      </p>
                    </div>
                  </label>

                </div>

                {(!watchAll.posEnabled && !watchAll.deliveryEnabled && !watchAll.clickCollectEnabled) && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Compulsory: At least one franchise module (POS, Delivery, or Click & Collect) must be selected!</span>
                  </div>
                )}
              </div>
            </SectionCard>

          </div>

          {/* Right Column: Reusable Store Card Preview & Save Action (4 Cols, Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">

              {/* ── Reusable Live Store Card Preview Component ── */}
              <StoreCardPreview
                name={watchAll.name}
                address={watchAll.address}
                phone={watchAll.phone}
                gstin={watchAll.gstin}
                openingTime={watchAll.openingTime}
                closingTime={watchAll.closingTime}
                radiusKm={watchAll.radiusKm}
                lat={watchAll.lat}
                long={watchAll.long}
                managerName={watchAll.managerName}
                managerEmail={watchAll.managerEmail}
                posEnabled={watchAll.posEnabled}
                deliveryEnabled={watchAll.deliveryEnabled}
                clickCollectEnabled={watchAll.clickCollectEnabled}
                showDownloadButton={true}
              />

              {/* ── Validation Checklist & Save Action ── */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  Validation Checklist
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {watchAll.name && watchAll.address && watchAll.phone && watchAll.gstin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className={watchAll.name && watchAll.address && watchAll.phone && watchAll.gstin ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                      Store name, address, 10-digit phone & GSTIN
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Boolean(watchAll.lat) && Boolean(watchAll.long) && Boolean(watchAll.radiusKm) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className={Boolean(watchAll.lat) && Boolean(watchAll.long) && Boolean(watchAll.radiusKm) ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                      GPS Lat, Long & Service Radius (Compulsory)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {watchAll.posEnabled || watchAll.deliveryEnabled || watchAll.clickCollectEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className={watchAll.posEnabled || watchAll.deliveryEnabled || watchAll.clickCollectEnabled ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                      At least 1 Franchise Module (Compulsory)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Store manager account credentials
                    </span>
                  </div>
                </div>

                {/* THE PRIMARY SAVE BUTTON */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="submit"
                    disabled={updateStore.isPending}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2.5 h-10 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {updateStore.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update Store Specifications
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
