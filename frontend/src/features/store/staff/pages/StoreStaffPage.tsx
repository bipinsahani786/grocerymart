import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Smartphone, 
  Key, 
  Clock, 
  Star,
  ToggleLeft,
  ToggleRight,
  Mail,
  Loader2,
  Trash2
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

type ActiveTab = 'directory' | 'add' | 'shifts' | 'performance';

export default function StoreStaffPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: staffData, isLoading } = useStoreStaff(storeId);
  const createStaff = useCreateStoreStaff();
  const deleteStaff = useDeleteStoreStaff();
  const toggleClock = useToggleStoreStaffClock();
  const updateShift = useUpdateStoreStaffShift();

  const staff = staffData || [];

  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');

  const roleOptions = [
    { value: 'Picker', label: 'Order Picker / Packer' },
    { value: 'Cashier', label: 'POS Cashier Counter' },
    { value: 'Delivery Rider', label: 'Delivery Rider Partner' },
    { value: 'Store Manager', label: 'Assistant Store Manager' }
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

  // Add Staff Form state asking all required fields
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Cashier',
    pin: '',
    shift: 'Morning',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      toast.error('Full Name is required!');
      return;
    }

    const cleanPhone = addForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Enter Valid phone number! (Must be 10 digits)');
      return;
    }

    if (!addForm.pin || addForm.pin.length !== 4 || !/^\d{4}$/.test(addForm.pin)) {
      toast.error('Login PIN must be exactly 4 digits!');
      return;
    }

    createStaff.mutate(
      {
        storeId,
        payload: {
          name: addForm.name.trim(),
          phone: cleanPhone,
          email: addForm.email.trim() || undefined,
          role: addForm.role,
          pin: addForm.pin,
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
            role: 'Cashier',
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
    if (!roleObj) return 'STAFF';
    if (typeof roleObj === 'string') return roleObj;
    if (typeof roleObj === 'object') {
      if (typeof roleObj.roleName === 'string' && roleObj.roleName) return roleObj.roleName;
      if (typeof roleObj.name === 'string' && roleObj.name) return roleObj.name;
      if (typeof roleObj.role === 'string' && roleObj.role) return roleObj.role;
      if (roleObj.role && typeof roleObj.role === 'object') {
        if (typeof roleObj.role.name === 'string' && roleObj.role.name) return roleObj.role.name;
        if (typeof roleObj.role.roleName === 'string' && roleObj.role.roleName) return roleObj.role.roleName;
      }
    }
    return 'STAFF';
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Users}
        title="Staff & Shift Management"
        subtitle="Manage accounts, view shifts, role pin codes, and picker performance metrics"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
          {[
            { id: 'directory', name: 'Staff Directory', icon: Users },
            { id: 'add', name: 'Add Staff Member', icon: Plus },
            { id: 'shifts', name: 'Shift Roster', icon: Calendar },
            { id: 'performance', name: 'Performance KPIs', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500 font-extrabold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'directory' && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              </div>
            ) : staff.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Staff Registered Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  There are no store staff members created in the database for this store.
                </p>
                <Button 
                  size="sm" 
                  className="mt-4" 
                  onClick={() => setActiveTab('add')}
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add Staff Member
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-page-enter">
                {staff.map((member: any) => {
                  const currentShift = member.shifts?.[0];
                  const isClockedIn = Boolean(currentShift?.clockIn && !currentShift?.clockOut);
                  const shiftName = currentShift?.shiftName ? currentShift.shiftName : 'Not Assigned';

                  return (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {(member.name || 'Staff').split(' ').map((n: any) => n.charAt(0)).join('')}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</h4>
                              <Badge variant="outline" className="text-[9px] uppercase font-bold mt-1">
                                {getRoleLabel(member.role)}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-right">
                            {isClockedIn ? (
                              <Badge variant="success" className="text-[9px] uppercase font-black px-2.5 py-0.5">
                                On Shift
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 text-muted-foreground">
                                Off Clock
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-border pt-3.5 text-xs space-y-2 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>{member.phone}</span>
                          </div>
                          {member.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>Login PIN: <span className="font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded font-mono text-xs tracking-widest">{member.pin ? member.pin : 'Not Set'}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>Current Shift: <span className="font-bold text-slate-800 dark:text-slate-200">{shiftName}</span></span>
                          </div>
                        </div>

                        <div className="border-t border-border pt-3.5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Clock Status / Remove</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleClock(member)}
                              disabled={toggleClock.isPending}
                              className="text-primary-500 hover:text-primary-600 transition-colors shrink-0 disabled:opacity-50"
                              title="Toggle Clock"
                            >
                              {isClockedIn ? (
                                <ToggleRight className="h-7 w-7 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${member.name} from store staff?`)) {
                                  deleteStaff.mutate({ storeId, staffId: member.id }, {
                                    onSuccess: () => toast.success('Staff member deleted successfully!'),
                                    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete staff member'),
                                  });
                                }
                              }}
                              disabled={deleteStaff.isPending}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Staff"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'add' && (
          <Card className="max-w-md mx-auto animate-page-enter overflow-visible relative z-30">
            <CardHeader>
              <CardTitle className="text-base font-black">Register New Staff Account</CardTitle>
              <CardDescription>Create store-level logins for cashiers, order pickers, or delivery partners.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible relative z-30">
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
                  <Input 
                    type="email"
                    placeholder="e.g. ramesh@grocerymart.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-40">
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

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('directory')}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm" disabled={createStaff.isPending}>
                    {createStaff.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    Add Staff Member
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'shifts' && (
          <Card className="animate-page-enter overflow-visible relative z-30">
            <CardHeader>
              <CardTitle className="text-base font-black">Shift Roster & Matrix Planner</CardTitle>
              <CardDescription>Assign and edit daily operating shift hours for active personnel.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-visible relative z-30">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No staff members exist in database to assign shifts.
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[300px] pb-12">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Assigned Shift Schedule</th>
                        <th className="p-4 text-center">Duty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {staff.map((member: any, idx: number) => {
                        const currentShift = member.shifts?.[0];
                        const isClockedIn = Boolean(currentShift?.clockIn && !currentShift?.clockOut);
                        const shiftName = currentShift?.shiftName ? currentShift.shiftName : '';

                        return (
                          <tr 
                            key={member.id} 
                            style={{ zIndex: 100 - idx, position: 'relative' }}
                            className="hover:bg-muted/10"
                          >
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{member.name}</td>
                            <td className="p-4">{getRoleLabel(member.role)}</td>
                            <td className="p-4">
                              <div className="w-[200px] relative">
                                <CustomDropdown
                                  options={shiftRosterOptions}
                                  value={shiftName}
                                  onChange={(v) => handleShiftChange(member.id, v)}
                                  triggerClassName="h-[30px] !text-[11px] font-semibold"
                                />
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {isClockedIn ? (
                                <Badge variant="success">Active Clocked In</Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">Logged Off</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'performance' && (
          <Card className="animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Performance Dashboard & KPIs</CardTitle>
              <CardDescription>Live efficiency metric trackers including order volume, packing rates, and ratings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No staff members exist in database to display performance metrics.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Position</th>
                      <th className="p-4 text-center">Processed Orders</th>
                      <th className="p-4 text-center">Average Handling Time</th>
                      <th className="p-4 text-right">Rating Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {staff.map((member: any) => {
                      const orderCount = member.performance?.ordersProcessed ?? (member.staffOrders?.length || 0);
                      const avgMinutes = member.performance?.avgPackTimeMinutes || 0;
                      const rating = member.performance?.rating;
                      const roleLabel = getRoleLabel(member.role);

                      return (
                        <tr key={member.id} className="hover:bg-muted/10">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{member.name}</td>
                          <td className="p-4 font-semibold text-muted-foreground">{roleLabel}</td>
                          <td className="p-4 text-center font-black">{orderCount} {orderCount === 1 ? 'order' : 'orders'}</td>
                          <td className="p-4 text-center font-bold">
                            {avgMinutes > 0 ? (
                              roleLabel === 'Delivery Rider' ? (
                                <span className="flex items-center justify-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-500" /> {avgMinutes} min avg drop</span>
                              ) : (
                                <span className="flex items-center justify-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-500" /> {avgMinutes} min avg pack</span>
                              )
                            ) : (
                              <span className="text-muted-foreground font-normal">N/A (No Orders)</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {rating ? (
                              <span className="inline-flex items-center gap-1 font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                <Star className="h-3 w-3 fill-amber-500" /> {rating} / 5.0
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs font-normal">No Ratings</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
