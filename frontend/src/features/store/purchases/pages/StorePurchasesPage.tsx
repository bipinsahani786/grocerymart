import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Layers,
  FileText,
  Building2,
  Percent,
  Check,
  Eye,
  ShieldCheck,
  Receipt,
  Calendar,
  Trash2
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import {
  usePurchaseOrders,
  useSuppliers,
  useStoreBatches,
  useCreatePurchaseOrder,
  useCreateSupplier,
  type CreatePurchaseOrderItemPayload
} from '@/features/store/api/useStorePurchases';
import { useStoreProducts } from '@/features/store/api/useStorePanel';
import { SearchBar } from '@/components/ui/SearchBar';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

type ActiveTab = 'purchases' | 'batches' | 'suppliers';

export default function StorePurchasesPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id || (user as any)?.storeId || (user as any)?.managedStore?.id;

  const [activeTab, setActiveTab] = useState<ActiveTab>('purchases');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Queries
  const { data: purchasesData, isLoading: isPurchasesLoading } = usePurchaseOrders(storeId);
  const { data: suppliersData, isLoading: isSuppliersLoading } = useSuppliers(storeId);
  const { data: batchesData, isLoading: isBatchesLoading } = useStoreBatches(storeId);
  const { data: productsData } = useStoreProducts(storeId);

  const purchaseOrders = purchasesData || [];
  const suppliers = suppliersData || [];
  const batches = batchesData || [];
  const products = productsData || [];

  // Mutations
  const createPurchaseMutation = useCreatePurchaseOrder();
  const createSupplierMutation = useCreateSupplier();

  // Modal States
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    contactPerson: '',
    address: '',
  });

  // Create Inward Purchase Order Form State
  const [poForm, setPoForm] = useState({
    supplierId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [poItems, setPoItems] = useState<CreatePurchaseOrderItemPayload[]>([
    {
      productId: '',
      batchNumber: `B-${Date.now().toString().slice(-6)}`,
      quantity: 10,
      costPrice: 0,
      mrp: 0,
      sellingPrice: 0,
      taxRate: 18,
      expiryDate: '',
    },
  ]);

  // Product Dropdown Options
  const productOptions = useMemo(() => {
    return products.map((p: any) => ({
      value: p.id,
      label: `${p.name} (${p.unit || 'pcs'}) ${p.barcode ? `- 🏷️ ${p.barcode}` : ''}`,
    }));
  }, [products]);

  const supplierOptions = useMemo(() => {
    return suppliers.map((s: any) => ({
      value: s.id,
      label: `${s.name} ${s.gstin ? `(GSTIN: ${s.gstin})` : ''}`,
    }));
  }, [suppliers]);

  // KPI Computations
  const totalPurchaseVolume = useMemo(() => {
    return purchaseOrders.reduce((sum: number, po: any) => sum + (Number(po.totalAmount) || 0), 0);
  }, [purchaseOrders]);

  const activeBatchesCount = batches.length;
  const suppliersCount = suppliers.length;

  // Live Calculations for Inward Form
  const inwardSummary = useMemo(() => {
    let subtotalCost = 0;
    let taxTotal = 0;
    poItems.forEach((item) => {
      const lineCost = (item.quantity || 0) * (item.costPrice || 0);
      const lineTax = (lineCost * (item.taxRate || 0)) / 100;
      subtotalCost += lineCost;
      taxTotal += lineTax;
    });
    return {
      subtotalCost,
      taxTotal,
      grandTotal: subtotalCost + taxTotal,
    };
  }, [poItems]);

  // Helper for Profit Margin %
  const calculateMargin = (cp: number, sp: number) => {
    if (!sp || sp <= 0) return '0.0';
    return (((sp - cp) / sp) * 100).toFixed(1);
  };

  // Add Row to PO Form
  const handleAddPOItem = () => {
    setPoItems((prev) => [
      ...prev,
      {
        productId: '',
        batchNumber: `B-${Date.now().toString().slice(-6)}-${prev.length + 1}`,
        quantity: 10,
        costPrice: 0,
        mrp: 0,
        sellingPrice: 0,
        taxRate: 18,
        expiryDate: '',
      },
    ]);
  };

  const handleRemovePOItem = (index: number) => {
    if (poItems.length === 1) {
      toast.error('Purchase Order must contain at least 1 product item.');
      return;
    }
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePOItem = (index: number, field: keyof CreatePurchaseOrderItemPayload, value: any) => {
    setPoItems((prev) => {
      const updated = [...prev];
      const currentItem = { ...updated[index], [field]: value };

      // Autofill price if product selected
      if (field === 'productId') {
        const prod = products.find((p: any) => p.id === value);
        if (prod) {
          currentItem.costPrice = prod.costPrice || prod.basePrice || 0;
          currentItem.sellingPrice = prod.basePrice || 0;
          currentItem.mrp = prod.mrp || prod.basePrice || 0;
          if (prod.taxRate !== undefined) {
            currentItem.taxRate = prod.taxRate;
          }
        }
      }

      updated[index] = currentItem;
      return updated;
    });
  };

  // Submit Inward Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplierId) {
      toast.error('Please select a Supplier for inward purchase.');
      return;
    }

    for (let i = 0; i < poItems.length; i++) {
      const item = poItems[i];
      if (!item.productId) {
        toast.error(`Item #${i + 1}: Product selection is required.`);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Item #${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (item.costPrice === undefined || item.costPrice < 0) {
        toast.error(`Item #${i + 1}: Valid Cost Price (CP) is required.`);
        return;
      }
    }

    createPurchaseMutation.mutate(
      {
        storeId,
        supplierId: poForm.supplierId,
        invoiceNumber: poForm.invoiceNumber,
        invoiceDate: poForm.invoiceDate,
        notes: poForm.notes,
        items: poItems,
      },
      {
        onSuccess: () => {
          setShowPOModal(false);
          setPoForm({
            supplierId: '',
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            notes: '',
          });
          setPoItems([
            {
              productId: '',
              batchNumber: `B-${Date.now().toString().slice(-6)}`,
              quantity: 10,
              costPrice: 0,
              mrp: 0,
              sellingPrice: 0,
              taxRate: 18,
              expiryDate: '',
            },
          ]);
        },
      }
    );
  };

  // Submit Supplier Form
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || supplierForm.name.length < 2) {
      toast.error('Supplier name must be at least 2 characters.');
      return;
    }
    if (!supplierForm.phone.trim() || !/^\d{10}$/.test(supplierForm.phone.trim())) {
      toast.error('Valid 10-digit mobile phone number is required.');
      return;
    }

    createSupplierMutation.mutate(
      {
        storeId,
        ...supplierForm,
      },
      {
        onSuccess: () => {
          setShowSupplierModal(false);
          setSupplierForm({
            name: '',
            phone: '',
            email: '',
            gstin: '',
            contactPerson: '',
            address: '',
          });
        },
      }
    );
  };

  // Columns for Purchase Orders Table
  const purchaseColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'PO & Invoice #',
      accessorKey: 'poNumber',
      sortable: true,
      cell: (po) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black border border-primary-500/20 shrink-0 shadow-2xs">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-black text-sm text-foreground block">{po.poNumber}</span>
            {po.invoiceNumber ? (
              <span className="text-[11px] text-muted-foreground font-semibold">Inv: #{po.invoiceNumber}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-medium italic">No Vendor Invoice #</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Supplier / Vendor',
      accessorKey: 'supplier.name',
      sortable: true,
      cell: (po) => (
        <div>
          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary-500" />
            {po.supplier?.name || 'Vendor'}
          </div>
          <div className="text-xs text-muted-foreground">📞 {po.supplier?.phone}</div>
        </div>
      ),
    },
    {
      header: 'Total Inward Bill',
      accessorKey: 'totalAmount',
      sortable: true,
      cell: (po) => (
        <div>
          <span className="font-mono font-black text-sm text-foreground text-emerald-600 dark:text-emerald-400">
            ₹{Number(po.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-muted-foreground block font-bold">
            Tax Paid: ₹{Number(po.totalTax || 0).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (po) => (
        <Badge variant="success" className="font-black text-[10px] uppercase px-2.5 py-1 gap-1">
          <Check className="h-3 w-3" /> {po.status || 'RECEIVED'}
        </Badge>
      ),
    },
    {
      header: 'Inward Date',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (po) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
          {new Date(po.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (po) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPO(po);
          }}
          className="h-8 px-3 text-xs font-bold gap-1 shadow-2xs hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30"
        >
          <Eye className="h-3.5 w-3.5 text-primary-500" /> View Breakdown
        </Button>
      ),
    },
  ], []);

  // Columns for Inventory Batches Table
  const batchColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Batch Number',
      accessorKey: 'batchNumber',
      sortable: true,
      cell: (b) => (
        <div>
          <span className="font-mono font-black text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded-lg">
            {b.batchNumber}
          </span>
          {b.expiryDate && (
            <span className="text-[10px] text-rose-500 font-bold block mt-1">
              Exp: {new Date(b.expiryDate).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Product Item',
      accessorKey: 'product.name',
      sortable: true,
      cell: (b) => (
        <div>
          <div className="font-bold text-sm text-foreground">{b.product?.name}</div>
          <div className="text-xs text-muted-foreground font-mono">SKU: {b.product?.sku || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Frozen Tax Rate (%)',
      accessorKey: 'taxRate',
      sortable: true,
      cell: (b) => (
        <Badge variant="warning" className="font-mono font-black text-xs px-2.5 py-1 gap-1">
          <ShieldCheck className="h-3 w-3" /> {b.taxRate || 0}% GST Locked
        </Badge>
      ),
    },
    {
      header: 'CP / SP / Margin',
      accessorKey: 'costPrice',
      sortable: true,
      cell: (b) => {
        const margin = calculateMargin(b.costPrice, b.sellingPrice);
        return (
          <div className="space-y-0.5 text-xs">
            <div><span className="text-muted-foreground">CP:</span> <span className="font-mono font-bold">₹{b.costPrice}</span></div>
            <div><span className="text-muted-foreground">SP:</span> <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{b.sellingPrice}</span></div>
            <div className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400">Margin: {margin}%</div>
          </div>
        );
      },
    },
    {
      header: 'Remaining Stock',
      accessorKey: 'currentQuantity',
      sortable: true,
      cell: (b) => (
        <div className="font-mono font-bold text-sm">
          <span className={b.currentQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
            {b.currentQuantity}
          </span>
          <span className="text-xs text-muted-foreground font-normal ml-1">/ {b.initialQuantity} {b.product?.unit || 'pcs'}</span>
        </div>
      ),
    },
  ], []);

  // Columns for Suppliers Table
  const supplierColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Supplier / Vendor',
      accessorKey: 'name',
      sortable: true,
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">{s.name}</div>
            {s.contactPerson && <div className="text-xs text-muted-foreground">Contact: {s.contactPerson}</div>}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      accessorKey: 'phone',
      cell: (s) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-foreground flex items-center gap-1">
            📞 {s.phone}
          </div>
          {s.email && <div className="text-muted-foreground">✉️ {s.email}</div>}
        </div>
      ),
    },
    {
      header: 'GSTIN Number',
      accessorKey: 'gstin',
      sortable: true,
      cell: (s) => (
        s.gstin ? (
          <span className="font-mono font-black text-xs bg-muted border border-border px-2.5 py-1 rounded-lg text-foreground">
            {s.gstin}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs font-medium italic">Unregistered Vendor</span>
        )
      ),
    },
  ], []);

  // Filter Data
  const filteredPurchases = useMemo(() => {
    return purchaseOrders.filter((po: any) => {
      const q = searchQuery.toLowerCase();
      return (
        (po.poNumber || '').toLowerCase().includes(q) ||
        (po.supplier?.name || '').toLowerCase().includes(q) ||
        (po.invoiceNumber || '').toLowerCase().includes(q)
      );
    });
  }, [purchaseOrders, searchQuery]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b: any) => {
      const q = searchQuery.toLowerCase();
      return (
        (b.batchNumber || '').toLowerCase().includes(q) ||
        (b.product?.name || '').toLowerCase().includes(q)
      );
    });
  }, [batches, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s: any) => {
      const q = searchQuery.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q) ||
        (s.gstin || '').toLowerCase().includes(q)
      );
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageHeader
        icon={ShoppingBag}
        title="Purchase & Stock Inward Register"
        subtitle="Manage vendor invoices, inward purchase orders, and frozen tax-rate inventory batches"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-6">

        {/* ── RICH MODERN KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-page-enter">
          
          <CustomKpiCard
            title="Total Purchase Spend"
            value={`₹${totalPurchaseVolume.toLocaleString('en-IN')}`}
            subtitle="Total inward invoice volume"
            icon={<ShoppingBag />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />

          <CustomKpiCard
            title="Active Stock Batches"
            value={activeBatchesCount}
            subtitle="Locked tax rates per batch"
            icon={<Layers />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />

          <CustomKpiCard
            title="Registered Vendors"
            value={suppliersCount}
            subtitle="Verified supplier accounts"
            icon={<Building2 />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />

          <CustomKpiCard
            title="Inward Orders Logged"
            value={purchaseOrders.length}
            subtitle="Goods receipt notes (GRN)"
            icon={<FileText />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
        </div>

        {/* ── SLEEK TABS NAVIGATION ── */}
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
          {[
            { id: 'purchases', name: 'Inward Purchases (GRN)', icon: ShoppingBag, count: purchaseOrders.length },
            { id: 'batches', name: 'Active Batches & Tax Lock', icon: Layers, count: batches.length },
            { id: 'suppliers', name: 'Suppliers Directory', icon: Building2, count: suppliers.length },
          ].map((tab: { id: string; name: string; icon: any; count?: number }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 -mb-[2px] transition-all whitespace-nowrap rounded-t-xl ${
                activeTab === tab.id
                  ? 'border-primary-600 text-white bg-primary-600 dark:border-primary-500 dark:bg-primary-500 dark:text-white shadow-sm'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ACTION HEADER & SEARCH FILTER BAR ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-card border border-border p-3.5 rounded-2xl shadow-xs">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={
                activeTab === 'purchases' ? 'Search PO #, supplier name or invoice...' :
                activeTab === 'batches' ? 'Search batch # or product name...' : 'Search vendor name, phone, or GSTIN...'
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSupplierModal(true)}
              className="gap-2 font-bold shadow-2xs whitespace-nowrap rounded-xl"
            >
              <Building2 className="h-4 w-4 text-primary-500" /> Add Vendor Supplier
            </Button>
            <Button
              size="sm"
              variant="brand"
              onClick={() => setShowPOModal(true)}
              className="gap-2 font-bold shadow-2xs whitespace-nowrap rounded-xl"
            >
              <Plus className="h-4 w-4" /> New Goods Inward (GRN)
            </Button>
          </div>
        </div>

        {/* ── TAB CONTENTS DATA TABLES ── */}
        {activeTab === 'purchases' && (
          <DataTable
            data={filteredPurchases}
            columns={purchaseColumns}
            isLoading={isPurchasesLoading}
            searchable={false}
            itemsPerPage={10}
            onRowClick={(po) => setSelectedPO(po)}
            emptyMessage="No inward purchase orders found."
          />
        )}

        {activeTab === 'batches' && (
          <DataTable
            data={filteredBatches}
            columns={batchColumns}
            isLoading={isBatchesLoading}
            searchable={false}
            itemsPerPage={10}
            emptyMessage="No active inventory batches found."
          />
        )}

        {activeTab === 'suppliers' && (
          <DataTable
            data={filteredSuppliers}
            columns={supplierColumns}
            isLoading={isSuppliersLoading}
            searchable={false}
            itemsPerPage={10}
            emptyMessage="No registered suppliers found."
          />
        )}

      </div>

      {/* ── CREATE INWARD PURCHASE ORDER MODAL ── */}
      <Modal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span>New Goods Inward Purchase Order (GRN)</span>
          </div>
        }
        maxWidth="4xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-6">
          
          {/* Supplier & Invoice Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Select Vendor Supplier *</label>
              <CustomDropdown
                options={supplierOptions}
                value={poForm.supplierId}
                onChange={(val) => setPoForm((p) => ({ ...p, supplierId: val }))}
                placeholder="Choose Vendor Account"
                searchable
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Vendor Invoice Number</label>
              <Input
                placeholder="e.g. INV-98210"
                value={poForm.invoiceNumber}
                onChange={(e) => setPoForm((p) => ({ ...p, invoiceNumber: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Invoice Date</label>
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                <CustomDatePicker
                  value={poForm.invoiceDate}
                  onChange={(val) => setPoForm((p) => ({ ...p, invoiceDate: val }))}
                  placeholder="Select Invoice Date"
                  className="h-full font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Product Items Table Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary-500" />
                Line Items & Batch Tax Lock ({poItems.length})
              </h4>
              <Button type="button" size="sm" variant="outline" onClick={handleAddPOItem} className="h-8 text-xs font-bold gap-1 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Add Product Item
              </Button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {poItems.map((item, idx) => {
                const margin = calculateMargin(item.costPrice, item.sellingPrice);
                return (
                  <div key={idx} className="p-4 rounded-2xl border border-border bg-card space-y-3 relative shadow-2xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/20">
                          Item #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Margin: {margin}%
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePOItem(idx)}
                        className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Product *</label>
                        <CustomDropdown
                          options={productOptions}
                          value={item.productId}
                          onChange={(val) => handleUpdatePOItem(idx, 'productId', val)}
                          placeholder="Search product from inventory..."
                          searchable
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Batch Number *</label>
                        <Input
                          value={item.batchNumber}
                          onChange={(e) => handleUpdatePOItem(idx, 'batchNumber', e.target.value)}
                          className="font-mono text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiry Date</label>
                        <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                          <CustomDatePicker
                            value={item.expiryDate || ''}
                            onChange={(val) => handleUpdatePOItem(idx, 'expiryDate', val)}
                            placeholder="Select Expiry"
                            className="h-full font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Inward Qty *</label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdatePOItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Cost Price (CP ₹) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.costPrice}
                          onChange={(e) => handleUpdatePOItem(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                          className="font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Selling Price (SP ₹) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={(e) => handleUpdatePOItem(idx, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">MRP (₹)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.mrp}
                          onChange={(e) => handleUpdatePOItem(idx, 'mrp', parseFloat(e.target.value) || 0)}
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                          <Percent className="h-3 w-3" /> Locked GST % *
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.taxRate}
                          onChange={(e) => handleUpdatePOItem(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="font-mono text-xs font-bold text-amber-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Inward Summary Footer */}
          <div className="flex items-center justify-between bg-muted/40 p-4 rounded-2xl border border-border">
            <div className="text-xs space-y-0.5">
              <p className="text-muted-foreground">Items Subtotal: <span className="font-mono font-bold text-foreground">₹{inwardSummary.subtotalCost.toFixed(2)}</span></p>
              <p className="text-muted-foreground">Tax Total: <span className="font-mono font-bold text-foreground">₹{inwardSummary.taxTotal.toFixed(2)}</span></p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Grand Inward Total</span>
                <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
                  ₹{inwardSummary.grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPOModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" isLoading={createPurchaseMutation.isPending} className="font-bold gap-1.5">
                  <Check className="h-4 w-4" /> Save & Receive Stock
                </Button>
              </div>
            </div>
          </div>

        </form>
      </Modal>

      {/* ── REGISTER SUPPLIER MODAL ── */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <span>Register Vendor Supplier</span>
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Supplier / Vendor Name *</label>
            <Input
              placeholder="e.g. Metro Wholesale Pvt Ltd"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Contact Phone (10 Digits) *</label>
            <Input
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
            <Input
              type="email"
              placeholder="e.g. vendor@metro.com"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">GSTIN Number (Optional)</label>
            <Input
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={supplierForm.gstin}
              onChange={(e) => setSupplierForm((p) => ({ ...p, gstin: e.target.value.toUpperCase() }))}
              className="font-mono text-xs"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSupplierModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={createSupplierMutation.isPending} className="font-bold gap-1.5">
              <Check className="h-4 w-4" /> Save Vendor Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── PURCHASE ORDER DETAILS MODAL ── */}
      <Modal
        isOpen={Boolean(selectedPO)}
        onClose={() => setSelectedPO(null)}
        title={
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary-500" />
            <span>Purchase Order Breakdown — {selectedPO?.poNumber}</span>
          </div>
        }
        maxWidth="2xl"
      >
        {selectedPO && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border text-xs">
              <div>
                <p className="text-muted-foreground">Supplier / Vendor:</p>
                <p className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-primary-500" /> {selectedPO.supplier?.name}
                </p>
                <p className="text-muted-foreground mt-0.5">📞 {selectedPO.supplier?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Total Inward Value:</p>
                <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xl">
                  ₹{Number(selectedPO.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-muted-foreground text-[11px] font-semibold">Tax Paid: ₹{Number(selectedPO.totalTax || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Purchased Items & Batches</h4>
              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
                {(selectedPO.items || []).map((item: any) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-bold text-foreground text-sm">{item.product?.name || 'Product'}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Batch: <span className="text-primary-600 dark:text-primary-400 font-bold">{item.batchNumber}</span> | Tax Locked: {item.taxRate}% GST
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-muted-foreground">{item.quantity} qty @ ₹{item.costPrice}</span>
                      <p className="text-xs font-mono font-black text-foreground">
                        ₹{(item.quantity * item.costPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
