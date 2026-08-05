import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Clock, 
  BadgeIndianRupee, 
  Printer, 
  Power,
  Save,
  Truck,
  Navigation,
  Locate
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useStoreSettings, useUpdateStoreSettings } from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

type ActiveTab = 'info' | 'hours' | 'tax' | 'pos' | 'delivery' | 'switches';

// Haversine formula to compute distance in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return parseFloat(d.toFixed(2));
};

export default function StoreSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: settingsData } = useStoreSettings(storeId);
  const updateSettingsMutation = useUpdateStoreSettings();

  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    gpsCoords: '28.6273, 77.3725',
    openingTime: '08:00',
    closingTime: '22:00',
    gstin: '',
    cgstRate: 9,
    sgstRate: 9,
    taxInclusive: true,
    receiptWidth: '80mm',
    autoPrintReceipt: true,
    radiusKm: '' as string | number,
    deliveryChargePerKm: '' as string | number,
    freeDeliveryKmRadius: '' as string | number,
    minDeliveryCharge: '' as string | number,
  });

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);

  // Live calculator test states
  const [testDistance, setTestDistance] = useState<string>('5');
  const [detectingGps, setDetectingGps] = useState<boolean>(false);

  useEffect(() => {
    if (settingsData) {
      setForm({
        name: settingsData.name || '',
        address: settingsData.address || '',
        phone: settingsData.phone || '',
        gpsCoords: (settingsData.lat !== undefined && settingsData.long !== undefined) ? `${settingsData.lat}, ${settingsData.long}` : '28.6273, 77.3725',
        openingTime: settingsData.openingTime || '08:00',
        closingTime: settingsData.closingTime || '22:00',
        gstin: settingsData.gstin || '',
        cgstRate: 9,
        sgstRate: 9,
        taxInclusive: true,
        receiptWidth: '80mm',
        autoPrintReceipt: true,
        radiusKm: settingsData.radiusKm !== undefined ? settingsData.radiusKm : '',
        deliveryChargePerKm: settingsData.deliveryChargePerKm || '',
        freeDeliveryKmRadius: settingsData.freeDeliveryKmRadius || '',
        minDeliveryCharge: settingsData.minDeliveryCharge || '',
      });
      setDeliveryEnabled(settingsData.deliveryEnabled ?? true);
      setPickupEnabled(settingsData.clickCollectEnabled ?? true);
    }
  }, [settingsData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [latStr, longStr] = form.gpsCoords.split(',').map(s => s.trim());
    const lat = parseFloat(latStr) || 28.6273;
    const long = parseFloat(longStr) || 77.3725;

    updateSettingsMutation.mutate(
      {
        storeId,
        payload: {
          name: form.name,
          address: form.address,
          phone: form.phone,
          lat,
          long,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          gstin: form.gstin,
          radiusKm: parseFloat(String(form.radiusKm)) || 0,
          deliveryChargePerKm: parseFloat(String(form.deliveryChargePerKm)) || 0,
          freeDeliveryKmRadius: parseFloat(String(form.freeDeliveryKmRadius)) || 0,
          minDeliveryCharge: parseFloat(String(form.minDeliveryCharge)) || 0,
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
                { id: 'delivery', name: 'Delivery & KM Rules', icon: Truck },
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
                        value={form.gstin}
                        onChange={(e) => setForm(prev => ({ ...prev, gstin: e.target.value }))}
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

              {activeTab === 'delivery' && (
                <div className="space-y-6 animate-page-enter">
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">Distance-Based Delivery Settings</h3>
                    <p className="text-xs text-muted-foreground">Configure kilometer-wise delivery fees and free shipping radiuses. These rules sync directly with POS checkout and the customer mobile applications.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Base / Minimum Delivery Charge (₹)</label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.minDeliveryCharge}
                          onChange={(e) => setForm(prev => ({ ...prev, minDeliveryCharge: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground">The base amount charged if the order doesn't qualify for free delivery.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Free Delivery Radius (KM)</label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.freeDeliveryKmRadius}
                          onChange={(e) => setForm(prev => ({ ...prev, freeDeliveryKmRadius: e.target.value }))}
                          placeholder="0.0"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground">Orders delivered within this distance radius are entirely free.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Rate Per Kilometer (₹/KM)</label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.deliveryChargePerKm}
                          onChange={(e) => setForm(prev => ({ ...prev, deliveryChargePerKm: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground">Charge per kilometer applied to the distance exceeding the free radius.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Maximum Service Radius Limit (KM)</label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.radiusKm}
                          onChange={(e) => setForm(prev => ({ ...prev, radiusKm: e.target.value }))}
                          placeholder="3.0"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground">The absolute maximum distance limits for delivery service routing.</p>
                      </div>
                    </div>

                    {/* Calculator Preview Widget */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-border space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Navigation className="h-4 w-4 text-primary-500" />
                          Live Delivery Fee Calculator
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Test distance rules using active browser location coordinates.</p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Enter Distance to Customer (KM)</label>
                          <div className="flex gap-2">
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={testDistance}
                              onChange={(e) => setTestDistance(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (!navigator.geolocation) {
                                  toast.error("Geolocation is not supported by your browser");
                                  return;
                                }
                                setDetectingGps(true);
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    setDetectingGps(false);
                                    const storeCoords = form.gpsCoords.split(',').map(Number);
                                    if (storeCoords.length === 2 && !isNaN(storeCoords[0]) && !isNaN(storeCoords[1])) {
                                      const distance = calculateDistance(
                                        storeCoords[0], storeCoords[1],
                                        pos.coords.latitude, pos.coords.longitude
                                      );
                                      setTestDistance(distance.toString());
                                      toast.success(`Location detected! Distance is ${distance} KM.`);
                                    } else {
                                      toast.error("Set valid store GPS coordinates under 'Store Profile' first.");
                                    }
                                  },
                                  (err) => {
                                    setDetectingGps(false);
                                    toast.error(`GPS access denied: ${err.message}`);
                                  }
                                );
                              }}
                              disabled={detectingGps}
                              className="text-[10px] uppercase font-bold shrink-0 flex items-center gap-1.5"
                            >
                              <Locate className="h-3.5 w-3.5" />
                              {detectingGps ? "Detecting..." : "Detect Location"}
                            </Button>
                          </div>
                        </div>

                        {/* Calculations result panel */}
                        <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1.5">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Calculated Delivery Fee</span>
                          <h3 className="text-2xl font-black text-primary-500">
                            ₹{(() => {
                              const dist = parseFloat(testDistance) || 0;
                              const freeKm = parseFloat(String(form.freeDeliveryKmRadius)) || 0;
                              const minCharge = parseFloat(String(form.minDeliveryCharge)) || 0;
                              const chargePerKm = parseFloat(String(form.deliveryChargePerKm)) || 0;
                              if (dist <= freeKm) return 0;
                              const chargeableDist = dist - freeKm;
                              const fee = Math.max(minCharge, chargeableDist * chargePerKm);
                              return parseFloat(fee.toFixed(2));
                            })()}
                          </h3>
                          <p className="text-[9px] text-muted-foreground italic font-sans leading-relaxed">
                            Formula used: <br/>
                            <code>distance &lt;= {form.freeDeliveryKmRadius || '0'} KM ? Free (₹0) : Max({form.minDeliveryCharge || '0'}, (distance - {form.freeDeliveryKmRadius || '0'}) * ₹{form.deliveryChargePerKm || '0'})</code>
                          </p>
                        </div>
                      </div>
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
