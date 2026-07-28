import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Clock, 
  BadgeIndianRupee, 
  Printer, 
  Power,
  Save,
  } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useStoreSettings, useUpdateStoreSettings } from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

type ActiveTab = 'info' | 'hours' | 'tax' | 'pos' | 'switches';

export default function StoreSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: settingsData } = useStoreSettings(storeId);
  const updateSettingsMutation = useUpdateStoreSettings();

  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  const [form, setForm] = useState({
    name: settingsData?.name || '',
    address: settingsData?.address || '',
    phone: settingsData?.phone || '',
    gpsCoords: '28.6273, 77.3725',
    openingTime: settingsData?.openingTime || '08:00',
    closingTime: settingsData?.closingTime || '22:00',
    gstin: settingsData?.gstin || '',
    gstNumber: settingsData?.gstin || '',
    cgstRate: 9,
    sgstRate: 9,
    taxInclusive: true,
    receiptWidth: '80mm',
    autoPrintReceipt: true,
    radiusKm: settingsData?.radiusKm || 3,
  });

  const [deliveryEnabled, setDeliveryEnabled] = useState(settingsData?.deliveryEnabled ?? true);
  const [pickupEnabled, setPickupEnabled] = useState(settingsData?.clickCollectEnabled ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(
      {
        storeId,
        payload: {
          name: form.name,
          address: form.address,
          phone: form.phone,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          gstin: form.gstin,
          radiusKm: parseFloat(String(form.radiusKm)),
          deliveryEnabled,
          clickCollectEnabled: pickupEnabled,
        },
      },
      {
        onSuccess: () => {
          toast.success('Store settings saved successfully!');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update store settings');
        },
      }
    );
  };

  const handleToggleChannel = (channel: 'delivery' | 'pickup') => {
    if (channel === 'delivery') {
      const nextVal = !deliveryEnabled;
      setDeliveryEnabled(nextVal);
      updateSettingsMutation.mutate({ storeId, payload: { deliveryEnabled: nextVal } });
      toast.success(nextVal ? 'Delivery channel activated!' : 'Delivery channel suspended!');
    } else {
      const nextVal = !pickupEnabled;
      setPickupEnabled(nextVal);
      updateSettingsMutation.mutate({ storeId, payload: { clickCollectEnabled: nextVal } });
      toast.success(nextVal ? 'Click & Collect channel activated!' : 'Click & Collect channel suspended!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Settings}
        title="Store Operations Settings"
        subtitle="Manage store metadata, working schedule hours, tax configuration, and online order switches"
      />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 items-start">
          
          {/* Sidebar Tabs */}
          <Card>
            <CardContent className="p-2 flex flex-col gap-1">
              {[
                { id: 'info', name: 'Store Profile', icon: Store },
                { id: 'hours', name: 'Working Hours', icon: Clock },
                { id: 'tax', name: 'Tax Config (GST)', icon: BadgeIndianRupee },
                { id: 'pos', name: 'POS & Printing', icon: Printer },
                { id: 'switches', name: 'Channel Switches', icon: Power }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white font-extrabold shadow-md shadow-primary-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.name}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Form Content Area */}
          <Card>
            <CardContent className="p-6 space-y-6">
              
              {activeTab === 'info' && (
                <div className="space-y-4 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">Store Profile</h3>
                    <p className="text-xs text-muted-foreground">General information matching physical outlet location parameters.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Store Outlet Name *</label>
                      <Input 
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Full Postal Address *</label>
                      <Input 
                        value={form.address}
                        onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">GPS Coordinates (lat, long) *</label>
                        <Input 
                          value={form.gpsCoords}
                          onChange={(e) => setForm(prev => ({ ...prev, gpsCoords: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Store Support Contact *</label>
                        <Input 
                          value={form.phone}
                          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="space-y-4 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">Operating Working Hours</h3>
                    <p className="text-xs text-muted-foreground">Specify timings during which online orders can be accepted and POS is open.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Opening Time *</label>
                      <Input 
                        type="time"
                        value={form.openingTime}
                        onChange={(e) => setForm(prev => ({ ...prev, openingTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Closing Time *</label>
                      <Input 
                        type="time"
                        value={form.closingTime}
                        onChange={(e) => setForm(prev => ({ ...prev, closingTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tax' && (
                <div className="space-y-4 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">GST Tax Config</h3>
                    <p className="text-xs text-muted-foreground">Adjust default CGST and SGST ratios calculated on POS receipts and online invoices.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Outlet GSTIN *</label>
                      <Input 
                        value={form.gstNumber}
                        onChange={(e) => setForm(prev => ({ ...prev, gstNumber: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">CGST Rate (%)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={form.cgstRate}
                          onChange={(e) => setForm(prev => ({ ...prev, cgstRate: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">SGST Rate (%)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={form.sgstRate}
                          onChange={(e) => setForm(prev => ({ ...prev, sgstRate: Number(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="taxInclusive"
                        checked={form.taxInclusive}
                        onChange={(e) => setForm(prev => ({ ...prev, taxInclusive: e.target.checked }))}
                        className="rounded border-input text-primary-500 h-4 w-4 cursor-pointer focus:ring-primary-500"
                      />
                      <label htmlFor="taxInclusive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Prices are GST Inclusive by default
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pos' && (
                <div className="space-y-4 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">POS & Printing Settings</h3>
                    <p className="text-xs text-muted-foreground">Adjust thermal print widths and receipt automation parameters.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1 z-20">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Thermal Receipt Width</label>
                      <CustomDropdown
                        options={[
                          { value: '80mm', label: '80mm Paper width (Standard Desktop Thermal)' },
                          { value: '58mm', label: '58mm Paper width (Compact Handheld Pos)' }
                        ]}
                        value={form.receiptWidth}
                        onChange={(v) => setForm(prev => ({ ...prev, receiptWidth: v as any }))}
                        triggerClassName="h-[38px] !text-xs font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="autoPrintReceipt"
                        checked={form.autoPrintReceipt}
                        onChange={(e) => setForm(prev => ({ ...prev, autoPrintReceipt: e.target.checked }))}
                        className="rounded border-input text-primary-500 h-4 w-4 cursor-pointer focus:ring-primary-500"
                      />
                      <label htmlFor="autoPrintReceipt" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Trigger automatic thermal receipt print on checkout completion
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'switches' && (
                <div className="space-y-4 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">Operational Channel Toggles</h3>
                    <p className="text-xs text-muted-foreground">Instantly pause or resume online store order channels during stock outages or peak rush times.</p>
                  </div>

                  <div className="divide-y divide-border pt-2">
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Online Delivery Orders</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Toggle delivery riders search routing for customer app orders.</p>
                      </div>
                      <Button 
                        type="button"
                        variant={deliveryEnabled ? 'brand' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleChannel('delivery')}
                        className="text-xs uppercase shrink-0 font-extrabold h-9 px-4 rounded-lg"
                      >
                        {deliveryEnabled ? 'ONLINE / PAUSE' : 'PAUSED / RESUME'}
                      </Button>
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Click & Collect (Self Pickup)</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Toggle token pickups availability on checkout channels.</p>
                      </div>
                      <Button 
                        type="button"
                        variant={pickupEnabled ? 'brand' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleChannel('pickup')}
                        className="text-xs uppercase shrink-0 font-extrabold h-9 px-4 rounded-lg"
                      >
                        {pickupEnabled ? 'ONLINE / PAUSE' : 'PAUSED / RESUME'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 flex justify-end">
                <Button type="submit" variant="brand" className="h-11 flex items-center gap-2 font-black uppercase text-xs">
                  <Save className="h-4 w-4" /> Save Store Settings
                </Button>
              </div>

            </CardContent>
          </Card>
          
        </form>
      </div>
    </div>
  );
}
