import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Smartphone, 
  Key, 
  Clock, 
  Star,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockStore, type Staff } from '@/store/mockStore';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

type ActiveTab = 'directory' | 'add' | 'shifts' | 'performance';

export default function StoreStaffPage() {
  const { staff, addStaff, updateStaffShift, toggleClockIn } = useMockStore();
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
    { value: 'Morning', label: 'Morning (7:00 AM - 3:00 PM)' },
    { value: 'Evening', label: 'Evening (3:00 PM - 11:00 PM)' },
    { value: 'Night', label: 'Night (11:00 PM - 7:00 AM)' },
    { value: 'Off', label: 'Scheduled Off' }
  ];

  // Add Staff Form state
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    role: 'Picker' as Staff['role'],
    pin: '',
    shift: 'Morning' as Staff['shift'],
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone || !addForm.pin) {
      toast.error('All asterisked fields are required!');
      return;
    }

    addStaff({
      name: addForm.name,
      phone: addForm.phone,
      role: addForm.role,
      pin: addForm.pin,
      shift: addForm.shift
    });

    toast.success(`Staff member "${addForm.name}" registered successfully!`);
    setAddForm({
      name: '',
      phone: '',
      role: 'Picker',
      pin: '',
      shift: 'Morning'
    });
    setActiveTab('directory');
  };

  const handleToggleClock = (id: string, name: string, isClockedIn: boolean) => {
    toggleClockIn(id);
    toast.success(`${name} ${isClockedIn ? 'clocked out' : 'clocked in'}!`);
  };

  const handleShiftChange = (id: string, shift: Staff['shift']) => {
    updateStaffShift(id, shift);
    toast.success(`Shift updated for staff member!`);
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
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-page-enter">
            {staff.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {member.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</h4>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold mt-1">
                          {member.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      {member.clockedIn ? (
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
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>Login PIN: <span className="font-bold text-slate-800 dark:text-slate-200">{member.pin}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>Current Shift: <span className="font-bold text-slate-800 dark:text-slate-200">{member.shift}</span></span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Toggle Clock Status</span>
                    <button 
                      onClick={() => handleToggleClock(member.id, member.name, member.clockedIn)}
                      className="text-primary-500 hover:text-primary-600 transition-colors shrink-0"
                    >
                      {member.clockedIn ? (
                        <ToggleRight className="h-7 w-7 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'add' && (
          <Card className="max-w-md mx-auto animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Register New Staff Account</CardTitle>
              <CardDescription>Create store-level logins for cashiers, order pickers, or delivery partners.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number *</label>
                  <Input 
                    placeholder="e.g. 9876543210"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Role Selection *</label>
                    <CustomDropdown
                      options={roleOptions}
                      value={addForm.role}
                      onChange={(v) => setAddForm(prev => ({ ...prev, role: v as Staff['role'] }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Login Secure PIN *</label>
                    <Input 
                      placeholder="4 digits"
                      maxLength={4}
                      value={addForm.pin}
                      onChange={(e) => setAddForm(prev => ({ ...prev, pin: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 z-20">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Default Work Shift</label>
                  <CustomDropdown
                    options={shiftOptions}
                    value={addForm.shift}
                    onChange={(v) => setAddForm(prev => ({ ...prev, shift: v as Staff['shift'] }))}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('directory')}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Add Staff</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'shifts' && (
          <Card className="animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Shift Roster & Matrix Planner</CardTitle>
              <CardDescription>Assign and edit daily operating shift hours for active personnel.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
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
                  {staff.map(member => (
                    <tr key={member.id} className="hover:bg-muted/10">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{member.name}</td>
                      <td className="p-4">{member.role}</td>
                      <td className="p-4 z-20">
                        <div className="w-[200px]">
                          <CustomDropdown
                            options={shiftRosterOptions}
                            value={member.shift}
                            onChange={(v) => handleShiftChange(member.id, v as Staff['shift'])}
                            triggerClassName="h-[30px] !text-[11px] font-semibold"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {member.clockedIn ? (
                          <Badge variant="success">Active Clocked In</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Logged Off</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {staff.map(member => (
                    <tr key={member.id} className="hover:bg-muted/10">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{member.name}</td>
                      <td className="p-4 font-semibold text-muted-foreground">{member.role}</td>
                      <td className="p-4 text-center font-black">{member.performance.ordersProcessed} orders</td>
                      <td className="p-4 text-center font-bold">
                        {member.role === 'Delivery Rider' ? (
                          <span className="flex items-center justify-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-500" /> {member.performance.avgPackTimeMinutes} min drop</span>
                        ) : (
                          <span className="flex items-center justify-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-500" /> {member.performance.avgPackTimeMinutes} min pack</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          <Star className="h-3 w-3 fill-amber-500" /> {member.performance.rating} / 5.0
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
