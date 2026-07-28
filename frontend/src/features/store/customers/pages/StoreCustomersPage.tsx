import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp, 
  UserPlus
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useStoreCustomers } from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';

export default function StoreCustomersPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: customersData } = useStoreCustomers(storeId);
  const customers = customersData || [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Register Customer Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // 1. Find currently selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find((c: any) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // 2. Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c: any) => {
      const q = searchQuery.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
    });
  }, [customers, searchQuery]);

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Customer "${newCustForm.name}" registered successfully!`);
    setNewCustForm({ name: '', phone: '', email: '' });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Users}
        title="Customer Directory & Khata"
        subtitle="Manage customer profiles, order histories, and credit khata books"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start">
          
          {/* Left Column: Customer Directory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
              <div className="relative flex-1 max-w-sm">
                <Input 
                  icon={<Search className="h-4 w-4" />} 
                  placeholder="Search by customer name or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="sm" variant="brand" onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Register Customer
              </Button>
            </div>

            {/* Register Modal Mock overlay */}
            {showAddModal && (
              <Card className="border-primary-500 bg-primary-500/[0.01]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black">Register New Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterCustomer} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name *</label>
                      <Input 
                        placeholder="Rahul" 
                        value={newCustForm.name} 
                        onChange={(e) => setNewCustForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number *</label>
                      <Input 
                        placeholder="9876543210" 
                        value={newCustForm.phone} 
                        onChange={(e) => setNewCustForm(p => ({ ...p, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="brand" size="sm" className="flex-1">Save</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Close</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="min-h-[480px]">
              <CardHeader>
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-wider">Customer Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">No customer records matching query.</div>
                  ) : (
                    filteredCustomers.map((cust: any) => {
                      const isOwed = (cust.khataBalance || 0) > 0;
                      const hasAdvance = (cust.khataBalance || 0) < 0;
                      
                      return (
                        <div
                          key={cust.id}
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                            selectedCustomerId === cust.id 
                              ? 'bg-primary-500/5 border-l-4 border-primary-500' 
                              : 'hover:bg-muted/30 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="min-w-0 pr-4 space-y-0.5">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cust.name}</h4>
                            <p className="text-xs text-muted-foreground">{cust.phone}</p>
                          </div>
                          
                          <div className="text-right shrink-0 flex items-center gap-4">
                            <div className="text-xs font-semibold text-muted-foreground hidden sm:block">
                              Spent: <span className="font-bold text-slate-800 dark:text-slate-200">₹{cust.totalSpent}</span>
                            </div>
                            
                            {isOwed && (
                              <Badge variant="warning" className="font-black text-[9px] uppercase px-2 py-0.5 animate-pulse">
                                Owes ₹{cust.khataBalance}
                              </Badge>
                            )}
                            {hasAdvance && (
                              <Badge variant="success" className="font-black text-[9px] uppercase px-2.5 py-0.5">
                                Adv ₹{Math.abs(cust.khataBalance)}
                              </Badge>
                            )}
                            {!isOwed && !hasAdvance && (
                              <Badge variant="outline" className="font-bold text-[9px] uppercase px-2.5 py-0.5 text-muted-foreground">
                                Clear
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Customer Details & Khata Book */}
          <div className="space-y-6">
            {selectedCustomer ? (
              <>
                {/* Details Header */}
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shrink-0">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-base text-slate-900 dark:text-white truncate">{selectedCustomer.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedCustomer.phone} {selectedCustomer.email ? `• ${selectedCustomer.email}` : ''}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-muted/30 p-3 rounded-lg border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Spent</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{selectedCustomer.totalSpent}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Khata Balance</span>
                        <p className={`text-lg font-black mt-1 ${
                          selectedCustomer.khataBalance > 0 ? 'text-amber-600 dark:text-amber-400' :
                          selectedCustomer.khataBalance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600'
                        }`}>
                          ₹{selectedCustomer.khataBalance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order History */}
                <Card>
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recent Channel Orders ({(selectedCustomer?.orders || []).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border max-h-[260px] overflow-y-auto pr-1">
                      {(selectedCustomer?.orders || []).length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground font-medium">No order activity logged.</div>
                      ) : (
                        (selectedCustomer.orders || []).map((order: any) => (
                          <div key={order.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/10">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{order.orderNumber || order.id} ({order.type})</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-black">₹{order.totalAmount}</span>
                              <p className="text-[9px] font-black text-emerald-500 uppercase mt-0.5">{order.status}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="p-12 text-center text-muted-foreground">Select a customer to load Khata history ledger details.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
