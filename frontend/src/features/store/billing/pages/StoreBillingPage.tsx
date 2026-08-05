import { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  ReceiptText,
  X,
  BadgeIndianRupee,
  CreditCard,
  Wallet,
  Coins,
  Layers
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import { useStoreBills } from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';

export default function StoreBillingPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: billsData, isLoading } = useStoreBills(storeId);
  const bills = billsData || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Calculate payment method statistics
  const stats = useMemo(() => {
    let allCount = 0;
    let allTotal = 0;
    let cashCount = 0;
    let cashTotal = 0;
    let upiCount = 0;
    let upiTotal = 0;
    let cardCount = 0;
    let cardTotal = 0;

    bills.forEach((bill: any) => {
      const amount = bill.order?.totalAmount || 0;
      const method = (bill.order?.payment?.method || 'CASH').toUpperCase();

      allCount++;
      allTotal += amount;

      if (method === 'CASH') {
        cashCount++;
        cashTotal += amount;
      } else if (method === 'UPI') {
        upiCount++;
        upiTotal += amount;
      } else if (method === 'CARD') {
        cardCount++;
        cardTotal += amount;
      }
    });

    return {
      all: { count: allCount, total: allTotal },
      cash: { count: cashCount, total: cashTotal },
      upi: { count: upiCount, total: upiTotal },
      card: { count: cardCount, total: cardTotal },
    };
  }, [bills]);

  // Filter bills by search query AND selected method
  const filteredBills = useMemo(() => {
    return bills.filter((b: any) => {
      // Filter by payment method card selection
      if (selectedMethod) {
        const method = (b.order?.payment?.method || 'CASH').toUpperCase();
        if (method !== selectedMethod) return false;
      }

      // Filter by search query
      const q = searchQuery.toLowerCase();
      const numMatch = (b.billNumber || b.id || '').toLowerCase().includes(q);
      const custMatch = (b.order?.customer?.name || b.order?.customerName || '').toLowerCase().includes(q);
      const phoneMatch = (b.order?.customer?.phone || b.order?.customerPhone || '').includes(q);
      return numMatch || custMatch || phoneMatch;
    });
  }, [bills, selectedMethod, searchQuery]);

  // Selected bill for Receipt preview
  const selectedBill = useMemo(() => {
    return bills.find((b: any) => b.id === selectedBillId) || bills[0];
  }, [bills, selectedBillId]);



  const handleOpenReceipt = (id: string) => {
    setSelectedBillId(id);
    setShowReceiptModal(true);
  };

  const handlePrintMock = () => {
    const printContent = document.getElementById('thermal-receipt-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      toast.error('Failed to open print window. Please allow popups.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Thermal Receipt</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              width: 280px;
              margin: 0 auto;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
            .text-center { text-align: center; }
            .space-y-1 > * { margin-bottom: 4px; }
            .space-y-4 > * { margin-bottom: 16px; }
            .border-t { border-top: 1px dashed #000; }
            .border-b { border-bottom: 1px dashed #000; }
            .py-2.5 { padding-top: 10px; padding-bottom: 10px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .pt-3 { padding-top: 12px; }
            .pt-4 { padding-top: 16px; }
            .pb-1.5 { padding-bottom: 6px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-\\[10px\\] { font-size: 10px; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .w-12 { width: 48px; }
            .w-16 { width: 64px; }
            .text-right { text-align: right; }
            .divide-y > * { border-bottom: 1px dotted #000; }
            .divide-y > *:last-child { border-bottom: none; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCardClick = (method: string | null) => {
    if (selectedMethod === method) {
      setSelectedMethod(null); // Deselect if clicked again
    } else {
      setSelectedMethod(method);
    }
  };

  // Define column definitions for custom DataTable component with truncated text styling
  const columns = [
    {
      header: "Invoice / Date",
      cell: (bill: any) => (
        <div className="max-w-[120px]">
          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate" title={bill.billNumber || bill.id}>
            {bill.billNumber || bill.id}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap">
            {new Date(bill.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {' '}
            {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      header: "Customer Details",
      cell: (bill: any) => (
        <div className="max-w-[160px]">
          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={bill.order?.customer?.name || bill.order?.customerName || 'Walk-in Customer'}>
            {bill.order?.customer?.name || bill.order?.customerName || 'Walk-in Customer'}
          </p>
          <p className="text-[9px] text-muted-foreground truncate" title={bill.order?.customer?.phone || bill.order?.customerPhone || 'N/A'}>
            {bill.order?.customer?.phone || bill.order?.customerPhone || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      header: "Sales Channel",
      cell: (bill: any) => (
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {bill.order?.type || 'POS'}
        </span>
      ),
    },
    {
      header: "Subtotal",
      cell: (bill: any) => (
        <span className="text-[11px] font-medium whitespace-nowrap">
          ₹{(bill.order?.subtotal || bill.order?.totalAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Tax (CGST+SGST)",
      cell: (bill: any) => (
        <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
          ₹{(bill.order?.taxAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Total Amount",
      cell: (bill: any) => (
        <span className="text-[11px] font-bold text-slate-950 dark:text-white whitespace-nowrap">
          ₹{(bill.order?.totalAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Method / Status",
      cell: (bill: any) => (
        <Badge variant="outline" className="text-[8px] font-bold whitespace-nowrap py-0.5 px-1.5">
          {bill.order?.payment?.method || 'CASH'} • {bill.order?.payment?.status || 'PAID'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={FileText}
        title="Billing & Invoices Ledger"
        subtitle="Manage thermal receipts, reprints, void/refund approvals, and cash counter reconciliation"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* KPI / Transaction Summary Cards using CustomKpiCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomKpiCard
            title="All Transactions"
            value={`₹${stats.all.total.toLocaleString()}`}
            subtitle={`${stats.all.count} bills generated`}
            icon={<Layers className="w-3.5 h-3.5" />}
            isActive={selectedMethod === null}
            onClick={() => handleCardClick(null)}
            colorClass={selectedMethod === null
              ? 'bg-primary-500 ring-2 ring-primary-700 dark:ring-primary-300'
              : 'bg-primary-500'
            }
            iconColorClass="text-white bg-white/20"
          />
          <CustomKpiCard
            title="Cash Transactions"
            value={`₹${stats.cash.total.toLocaleString()}`}
            subtitle={`${stats.cash.count} bills paid via Cash`}
            icon={<Coins className="w-3.5 h-3.5" />}
            isActive={selectedMethod === 'CASH'}
            onClick={() => handleCardClick('CASH')}
            colorClass={selectedMethod === 'CASH'
              ? 'bg-primary-500 ring-2 ring-primary-700 dark:ring-primary-300'
              : 'bg-primary-500'
            }
            iconColorClass="text-white bg-white/20"
          />
          <CustomKpiCard
            title="UPI Transactions"
            value={`₹${stats.upi.total.toLocaleString()}`}
            subtitle={`${stats.upi.count} bills paid via UPI`}
            icon={<Wallet className="w-3.5 h-3.5" />}
            isActive={selectedMethod === 'UPI'}
            onClick={() => handleCardClick('UPI')}
            colorClass={selectedMethod === 'UPI'
              ? 'bg-primary-500 ring-2 ring-primary-700 dark:ring-primary-300'
              : 'bg-primary-500'
            }
            iconColorClass="text-white bg-white/20"
          />
          <CustomKpiCard
            title="Card Transactions"
            value={`₹${stats.card.total.toLocaleString()}`}
            subtitle={`${stats.card.count} bills paid via Card`}
            icon={<CreditCard className="w-3.5 h-3.5" />}
            isActive={selectedMethod === 'CARD'}
            onClick={() => handleCardClick('CARD')}
            colorClass={selectedMethod === 'CARD'
              ? 'bg-primary-500 ring-2 ring-primary-700 dark:ring-primary-300'
              : 'bg-primary-500'
            }
            iconColorClass="text-white bg-white/20"
          />
        </div>

        {/* Search & Actions Bar with Custom SearchBar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
          <div className="relative flex-1 max-w-sm">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search bills by ID, customer, phone..."
            />
          </div>
          <div className="bg-muted/40 px-4 py-2 rounded-lg border border-border flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <BadgeIndianRupee className="h-4 w-4 text-emerald-500" />
            <span>Active Store GSTIN</span>
          </div>
        </div>

        {/* Redesigned Invoices List using custom DataTable */}
        <Card className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Transaction Records</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedMethod ? `Showing only ${selectedMethod} transactions` : 'Showing all transactions'}
              </p>
            </div>
            {selectedMethod && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedMethod(null)}>
                Clear filter <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
          <DataTable
            data={filteredBills}
            columns={columns}
            isLoading={isLoading}
            itemsPerPage={10}
            onRowClick={(bill) => handleOpenReceipt(bill.id)}
            emptyMessage="No invoices found matching current filters."
          />
        </Card>

        {/* Thermal Receipt Preview Modal Mock */}
        {showReceiptModal && selectedBill && (
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
              <div id="thermal-receipt-content" className="flex-1 overflow-y-auto py-6 font-mono text-xs text-slate-800 dark:text-slate-300 space-y-4 pr-1 scrollbar-thin select-none">
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-slate-950 dark:text-white">GroceryMart Store</h4>
                  <p className="text-[10px] leading-tight text-slate-500">Store Outlet #1</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-[10px] space-y-1 text-slate-500">
                  <p className="flex justify-between">
                    <span>INVOICE: {selectedBill.billNumber || selectedBill.id}</span>
                    <span>TYPE: {selectedBill.order?.type || 'POS'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>DATE: {new Date(selectedBill.createdAt).toLocaleDateString()}</span>
                    <span>TIME: {new Date(selectedBill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>CUST: {selectedBill.order?.customer?.name || selectedBill.order?.customerName || 'Walk-in'}</span>
                    <span>PH: {selectedBill.order?.customer?.phone || selectedBill.order?.customerPhone || 'N/A'}</span>
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
                    {(selectedBill?.order?.items || []).map((item: any, idx: number) => {
                      const qty = item.qty || item.quantity || 1;
                      const price = item.priceAtOrder ?? item.price ?? item.unitPrice ?? item.product?.basePrice ?? 0;
                      const lineTotal = item.lineTotal || (price * qty);
                      return (
                        <div key={idx} className="py-2 flex justify-between">
                          <span className="truncate pr-2">{item.name || item.product?.name || 'Item'}</span>
                          <span className="w-12 text-center shrink-0">{qty}</span>
                          <span className="w-16 text-right shrink-0">₹{lineTotal}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GST Taxation and Totals */}
                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 text-[10px] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>CGST (9%)</span>
                    <span>₹{Math.round((selectedBill?.order?.taxAmount || 0) / 2 * 100) / 100}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST (9%)</span>
                    <span>₹{Math.round((selectedBill?.order?.taxAmount || 0) / 2 * 100) / 100}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount:</span>
                    <span>-₹{selectedBill?.order?.discount || 0}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-slate-950 dark:text-white">
                    <span>GRAND TOTAL:</span>
                    <span>₹{selectedBill?.order?.totalAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Payment: {selectedBill?.order?.payment?.method || 'CASH'}</span>
                    <span>Status: {selectedBill?.order?.payment?.status || 'SUCCESS'}</span>
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
