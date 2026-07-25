import { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  RotateCcw, 
  ReceiptText, 
  X,
  
  
  
  BadgeIndianRupee
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockStore} from '@/store/mockStore';
import { toast } from 'sonner';

export default function StoreBillingPage() {
  const { orders, refundOrder, settings } = useMockStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // 1. Filtered bills (POS, Delivery, C&C orders that have succeeded or been refunded)
  const filteredBills = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(q) || 
                            o.customerName.toLowerCase().includes(q) ||
                            o.customerPhone.includes(q);
      return matchesSearch;
    });
  }, [orders, searchQuery]);

  // 2. Selected order for Receipt preview
  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  // 3. Initiate Refund / Void bill
  const handleRefund = (id: string) => {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    
    if (o.status === 'REFUNDED') {
      toast.warning('This transaction has already been voided/refunded!');
      return;
    }

    refundOrder(id);
    toast.success(`Transaction Voided!`, {
      description: `Bill ${id} has been marked as REFUNDED. Items returned to inventory.`
    });
  };

  const handleOpenReceipt = (id: string) => {
    setSelectedOrderId(id);
    setShowReceiptModal(true);
  };

  const handlePrintMock = () => {
    toast.success('Receipt sent to POS printer!', {
      description: `Simulated print on ${settings.receiptWidth} thermal paper.`,
      duration: 3500
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={FileText}
        title="Billing & Invoices Ledger"
        subtitle="Manage thermal receipts, reprints, void/refund approvals, and cash counter reconciliation"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-4">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
          <div className="relative flex-1 max-w-sm">
            <Input 
              icon={<Search className="h-4 w-4" />} 
              placeholder="Search bills by ID, Customer name or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-muted/40 px-4 py-2 rounded-lg border border-border flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <BadgeIndianRupee className="h-4 w-4 text-emerald-500" />
            <span>Active GSTIN: <span className="font-extrabold">{settings.gstNumber}</span></span>
          </div>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-wider">Transaction Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Invoice / Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Sales Channel</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Tax (CGST+SGST)</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Method / Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-muted-foreground font-semibold">
                      No invoices found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(bill => {
                    const taxVal = bill.taxAmount;
                    return (
                      <tr key={bill.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{bill.id}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(bill.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {' '}
                            {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{bill.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{bill.customerPhone}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-400">{bill.type}</td>
                        <td className="p-4 font-semibold text-muted-foreground">₹{bill.totalAmount + bill.discount - taxVal}</td>
                        <td className="p-4 font-semibold text-muted-foreground">₹{taxVal}</td>
                        <td className="p-4 font-black">₹{bill.totalAmount}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{bill.paymentMethod}</span>
                            <Badge 
                              variant={
                                bill.status === 'REFUNDED' ? 'destructive' : 
                                bill.paymentStatus === 'Success' ? 'success' : 'warning'
                              }
                              className="text-[8px] px-2 uppercase font-black"
                            >
                              {bill.status === 'REFUNDED' ? 'VOIDED/REFUNDED' : bill.paymentStatus}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 flex items-center gap-1 text-[10px] uppercase font-bold"
                              onClick={() => handleOpenReceipt(bill.id)}
                            >
                              <Printer className="h-3.5 w-3.5" /> Receipt
                            </Button>
                            {bill.status !== 'REFUNDED' && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 flex items-center gap-1 text-[10px] uppercase font-bold"
                                onClick={() => handleRefund(bill.id)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Void
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Thermal Receipt Preview Modal Mock */}
        {showReceiptModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
              
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              <div className="flex items-center gap-2 pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                <ReceiptText className="h-5 w-5 text-primary-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">Thermal Receipt Preview</h3>
              </div>

              {/* Monospace Thermal Receipt Layout */}
              <div className="flex-1 overflow-y-auto py-6 font-mono text-xs text-slate-800 dark:text-slate-300 space-y-4 pr-1 scrollbar-thin select-none">
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-slate-950 dark:text-white">{settings.name}</h4>
                  <p className="text-[10px] leading-tight text-slate-500">{settings.address}</p>
                  <p className="text-[10px] text-slate-500">PH: {settings.phone}</p>
                  <p className="text-[10px] text-slate-500">GSTIN: {settings.gstNumber}</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-[10px] space-y-1 text-slate-500">
                  <p className="flex justify-between">
                    <span>INVOICE: {selectedOrder.id}</span>
                    <span>TYPE: {selectedOrder.type}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>DATE: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    <span>TIME: {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>CUST: {selectedOrder.customerName}</span>
                    <span>PH: {selectedOrder.customerPhone}</span>
                  </p>
                </div>

                {/* Items Table */}
                <div className="space-y-1.5 py-1 text-[10px]">
                  <div className="flex justify-between font-bold border-b border-dashed border-slate-300 dark:border-slate-700 pb-1.5 text-slate-950 dark:text-white">
                    <span>ITEM NAME</span>
                    <span className="w-12 text-center">QTY</span>
                    <span className="w-16 text-right">PRICE</span>
                  </div>
                  <div className="divide-y divide-dotted divide-slate-200 dark:divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex justify-between">
                        <span className="truncate pr-2">{item.productName}</span>
                        <span className="w-12 text-center shrink-0">{item.qty}</span>
                        <span className="w-16 text-right shrink-0">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GST Taxation and Totals */}
                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 text-[10px] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>CGST ({settings.cgstRate}%)</span>
                    <span>₹{Math.round(selectedOrder.taxAmount / 2 * 100) / 100}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST ({settings.sgstRate}%)</span>
                    <span>₹{Math.round(selectedOrder.taxAmount / 2 * 100) / 100}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-slate-950 dark:text-white">
                    <span>GRAND TOTAL:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Payment: {selectedOrder.paymentMethod}</span>
                    <span>Status: {selectedOrder.paymentStatus}</span>
                  </div>
                </div>

                <div className="text-center pt-4 text-[10px] text-slate-500 border-t border-dashed border-slate-300 dark:border-slate-700">
                  <p>*** THANK YOU FOR SHOPPING ***</p>
                  <p>Auto GST Invoice generated by GroceryMart</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReceiptModal(false)} className="flex-1 text-xs">
                  Close
                </Button>
                <Button variant="brand" size="sm" onClick={handlePrintMock} className="flex-1 text-xs flex items-center gap-1.5 justify-center">
                  <Printer className="h-4 w-4" /> Print Thermal
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
