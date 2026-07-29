import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Edit3,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  PackageSearch,
  Layers,
  Trash2,
  Download,
  Package,
  Building,
  Barcode,
  DollarSign,
  Archive,
  Tags,
  Activity,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import {
  useStoreInventory,
  useAllStoreCategories,
  useCreateStoreProduct,
  useUpdateStoreProduct,
  useAdjustStoreStock,
  useDeleteStoreProduct,
  useImportMasterProducts
} from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Modal } from '@/components/ui/modal';
import { StoreAddProductForm } from '../components/StoreAddProductForm';

type ActiveTab = 'list' | 'add' | 'edit' | 'stock' | 'bulk';

export default function StoreInventoryPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: productsData } = useStoreInventory(storeId, searchQuery);
  const { data: categoriesData } = useAllStoreCategories(storeId);

  const createProduct = useCreateStoreProduct();
  const updateProductMutation = useUpdateStoreProduct();
  const adjustStockMutation = useAdjustStoreStock();
  const deleteProductMutation = useDeleteStoreProduct();
  const importMasterProducts = useImportMasterProducts();

  const handleImportMaster = () => {
    setIsImportModalOpen(true);
  };

  const confirmImportMaster = () => {
    importMasterProducts.mutate({ storeId }, {
      onSuccess: (res) => {
        toast.success(res.message || `Successfully imported ${res.data?.importedCount || 0} new products!`);
        setIsImportModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to import master products');
        setIsImportModalOpen(false);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate(
      { productId: editingProductId, storeId, payload: editForm },
      {
        onSuccess: () => {
          toast.success('Product details updated successfully!');
          setActiveTab('list');
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to update product');
        }
      }
    );
  };

  const products = productsData || [];
  const categories = categoriesData || [];

  const [activeTab, setActiveTab] = useState<ActiveTab>('list');

  // Selected product for edit
  const [editingProductId, setEditingProductId] = useState<string>('');
  
  // Product being deleted
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    categoryId: '',
    unit: 'pcs',
    basePrice: 0,
    sellingPrice: 0,
    stock: 0,
    lowStockAt: 10,
    sku: '',
    barcode: '',
    rackLocation: '',
  });

  // Stock Form State
  const [stockForm, setStockForm] = useState({
    productId: '',
    delta: 0,
    reason: 'Restocking',
  });

  // Bulk Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Dropdown Option Mappings for CustomDropdown
  const filterCategories = useMemo(() => {
    return [
      { id: 'All', name: 'All Categories', parentId: null },
      ...categories
    ];
  }, [categories]);

  const formCategoryOptions = useMemo(() => {
    return categories.map((c: any) => ({ value: c.id, label: c.name }));
  }, [categories]);

  const unitOptions = [
    { value: 'pcs', label: 'Piece (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gm', label: 'Gram (gm)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'pack', label: 'Pack' }
  ];

  const productOptions = useMemo(() => {
    return products.map((p: any) => {
      const invQty = p.inventory?.[0]?.quantity ?? 0;
      return {
        value: p.id,
        label: `${p.name} (Current: ${invQty})`
      };
    });
  }, [products]);

  const reasonOptions = [
    { value: 'Restocking', label: 'Restocking Shipment' },
    { value: 'Wastage / damaged', label: 'Wastage / damaged items' },
    { value: 'Audit discrepancy', label: 'Physical audit correction' },
    { value: 'Customer Return', label: 'Customer Return' }
  ];

  const stockFilterOptions = [
    { value: 'All', label: 'All Stock Status' },
    { value: 'InStock', label: 'In Stock' },
    { value: 'LowStock', label: 'Low Stock' },
    { value: 'OutOfStock', label: 'Out of Stock' }
  ];

  // 1. Filtered products for listing
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode || '').includes(searchQuery);
      const matchesCategory = categoryFilter === 'All' || p.categoryId === categoryFilter;
      
      const q = p.inventory?.[0]?.quantity || 0;
      const lowStockAt = p.lowStockAt || 10;
      let matchesStock = true;
      if (stockFilter === 'InStock') matchesStock = q > 0;
      if (stockFilter === 'LowStock') matchesStock = q > 0 && q <= lowStockAt;
      if (stockFilter === 'OutOfStock') matchesStock = q <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // 2. Set up edit form values
  const handleStartEdit = (product: any) => {
    const inv = product.inventory?.[0];
    setEditingProductId(product.id);
    setEditForm({
      name: product.name || '',
      brand: product.brand || '',
      categoryId: product.categoryId || '',
      unit: product.unit || 'pcs',
      basePrice: product.basePrice || 0,
      sellingPrice: product.basePrice || 0,
      stock: inv?.quantity || 0,
      lowStockAt: inv?.lowStockAt || 10,
      sku: product.sku || '',
      barcode: product.barcode || '',
      rackLocation: '',
    });
    setActiveTab('edit');
  };


  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deltaVal = Number(stockForm.delta);
    if (!stockForm.productId || deltaVal === 0) {
      toast.error('Please select a product and provide non-zero adjustment quantity!');
      return;
    }

    adjustStockMutation.mutate(
      { productId: stockForm.productId, delta: deltaVal, storeId },
      {
        onSuccess: () => {
          toast.success(`Inventory stock adjusted successfully!`);
          setActiveTab('list');
          setStockForm({ productId: '', delta: 0, reason: 'Restocking' });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to adjust stock');
        },
      }
    );
  };

  // 4. Simulated CSV upload
  const handleBulkUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setUploading(true);

    setTimeout(() => {
      setUploading(false);
      setCsvFile(null);
      toast.success('Bulk import completed!', {
        description: 'Successfully parsed and processed products CSV for store catalog.',
      });
      setActiveTab('list');
    }, 1200);
  };

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const outOfStock = products.filter((p: any) => (p.inventory?.[0]?.quantity || 0) <= 0).length;
  const lowStock = products.filter((p: any) => {
    const q = p.inventory?.[0]?.quantity || 0;
    return q > 0 && q <= (p.lowStockAt || 10);
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Boxes}
        title="Unified Store Inventory"
        subtitle="Manage product listings, SKU catalog parameters, stock updates, and bulk CSV uploads"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-6">

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-page-enter">
          <CustomKpiCard
            title="Total Catalog Items"
            value={totalProducts}
            subtitle="Products configured for this store"
            icon={<PackageSearch />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Active Categories"
            value={totalCategories}
            subtitle="Taxonomy groups in use"
            icon={<Layers />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Low Stock Alerts"
            value={lowStock}
            subtitle="Items needing replenishment"
            icon={<AlertTriangle />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Out of Stock"
            value={outOfStock}
            subtitle="Currently unavailable items"
            icon={<CheckCircle />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'list', name: 'Product List', icon: Boxes },
              { id: 'add', name: 'Add Product', icon: Plus },
              { id: 'edit', name: 'Edit Product', icon: Edit3, disabled: !editingProductId },
              { id: 'stock', name: 'Stock Update', icon: RefreshCw },
              { id: 'bulk', name: 'Bulk Upload', icon: Upload }
            ].map(tab => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 -mb-[1px] transition-all relative ${activeTab === tab.id
                    ? 'border-primary-600 text-white bg-primary-600 dark:border-primary-500 dark:bg-primary-500 dark:text-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg'
                  } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportMaster}
            disabled={importMasterProducts.isPending}
            className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hidden sm:flex shrink-0 mb-1"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            Import Master Products
          </Button>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'list' && (
          <div className="space-y-4 animate-page-enter">
            {/* Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="w-full xl:max-w-md shrink-0">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search catalog by name, barcode or SKU..."
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap hidden sm:inline-block">Category:</span>
                  <div className="w-full sm:w-[200px] z-20">
                    <CascadingCategoryDropdown
                      categories={filterCategories}
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      triggerClassName="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap hidden sm:inline-block">Stock:</span>
                  <div className="w-full sm:w-[200px] z-10">
                    <CustomDropdown
                      options={stockFilterOptions}
                      value={stockFilter}
                      onChange={setStockFilter}
                      triggerClassName="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Datatable */}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Barcode / SKU</th>
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Base Cost</th>
                      <th className="p-4">Selling Price</th>
                      <th className="p-4 text-center">Stock Level</th>
                      <th className="p-4">Location</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-muted-foreground font-semibold">
                          No matching products found in store catalog.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p: any) => {
                        const catName = categories.find((c: any) => c.id === p.categoryId)?.name || 'Unknown';
                        const isLowStock = p.stock <= p.lowStockAt;
                        return (
                          <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800 dark:text-white">{p.barcode}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{p.sku}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {p.imageUrls?.[0] ? (
                                  <img 
                                    src={p.imageUrls[0]} 
                                    alt={p.name} 
                                    className="w-10 h-10 rounded-md object-cover border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border border-border shrink-0">
                                    <Boxes className="w-5 h-5 text-muted-foreground opacity-50" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] font-semibold text-muted-foreground">Unit: {p.unit}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="font-bold text-[10px]">
                                {catName}
                              </Badge>
                            </td>
                            <td className="p-4 font-semibold text-muted-foreground">₹{p.basePrice}</td>
                            <td className="p-4 font-black">₹{p.sellingPrice}</td>
                            <td className="p-4 text-center">
                              {isLowStock ? (
                                <Badge variant="destructive" className="font-extrabold text-[10px] animate-pulse">
                                  {p.stock} Qty (Low)
                                </Badge>
                              ) : (
                                <Badge variant="success" className="font-extrabold text-[10px]">
                                  {p.stock} Qty
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{p.rackLocation}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleStartEdit(p)}
                                >
                                  <Edit3 className="h-4 w-4 text-primary-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => setDeletingProduct(p)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
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
          </div>
        )}

        {activeTab === 'add' && (
          <StoreAddProductForm
            storeId={storeId}
            categories={categories}
            onCancel={() => setActiveTab('list')}
            onSuccess={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'edit' && (
          <div className="space-y-6 animate-page-enter max-w-[1200px] mx-auto py-4">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('list')} className="hover:bg-muted/50 rounded-full">
                <ArrowLeft className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
              </Button>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-6 h-6 text-primary-500" />
                  Edit Store Product
                </h2>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  Adjust properties of {editForm.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Package className="w-4 h-4 text-primary-500" />
                        Basic Information
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Product Title <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            required
                            placeholder="e.g. Misti Dahi 500g"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            icon={<Package className="w-4 h-4 text-slate-400" />}
                          />
                        </div>

                        <div className="space-y-1.5 z-30">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Store Category <span className="text-rose-500">*</span>
                          </label>
                          <CascadingCategoryDropdown
                            categories={categories}
                            value={editForm.categoryId}
                            onChange={(val) => setEditForm(prev => ({ ...prev, categoryId: val }))}
                            placeholder="Select Category"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Brand Name
                          </label>
                          <Input
                            placeholder="e.g. ITC / Fortune"
                            value={editForm.brand}
                            onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                            icon={<Building className="w-4 h-4 text-slate-400" />}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Barcode (EAN/UPC) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            required
                            placeholder="8901234567890"
                            value={editForm.barcode}
                            onChange={(e) => setEditForm(prev => ({ ...prev, barcode: e.target.value }))}
                            icon={<Barcode className="w-4 h-4 text-slate-400" />}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            SKU (Stock Keeping Unit)
                          </label>
                          <Input
                            placeholder="Auto-generated if empty"
                            value={editForm.sku}
                            onChange={(e) => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                            icon={<Tags className="w-4 h-4 text-slate-400" />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Pricing Details
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Selling Price <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={editForm.sellingPrice === 0 ? '' : editForm.sellingPrice}
                            onChange={(e) => setEditForm(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
                            className="border-emerald-500/50 focus:border-emerald-500 ring-emerald-500/20 focus-visible:ring-emerald-500/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Cost Price (Base)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.basePrice === 0 ? '' : editForm.basePrice}
                            onChange={(e) => setEditForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            icon={<Activity className="w-4 h-4 text-slate-400" />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Archive className="w-4 h-4 text-blue-500" />
                        Inventory Settings
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Current Stock Qty
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={editForm.stock === 0 ? '' : editForm.stock}
                          onChange={(e) => setEditForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          icon={<Layers className="w-4 h-4 text-slate-400" />}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Low Stock Threshold
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={editForm.lowStockAt === 0 ? '' : editForm.lowStockAt}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lowStockAt: parseInt(e.target.value) || 0 }))}
                          placeholder="5"
                          icon={<Activity className="w-4 h-4 text-slate-400" />}
                        />
                      </div>

                      <div className="space-y-1.5 z-20">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Selling Unit
                        </label>
                        <CustomDropdown
                          options={unitOptions}
                          value={editForm.unit}
                          onChange={(val) => setEditForm(prev => ({ ...prev, unit: String(val) }))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Rack Location
                        </label>
                        <Input
                          placeholder="e.g. Aisle B2-S1"
                          value={editForm.rackLocation}
                          onChange={(e) => setEditForm(prev => ({ ...prev, rackLocation: e.target.value }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="pt-2 flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      variant="brand" 
                      size="lg" 
                      className="w-full font-bold shadow-md h-12 text-sm uppercase tracking-wider"
                      disabled={updateProductMutation.isPending}
                    >
                      {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg" 
                      className="w-full font-bold h-12 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400"
                      onClick={() => setActiveTab('list')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'stock' && (
          <Card className="max-w-md mx-auto animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary-500" />
                Quick Stock Adjustment
              </CardTitle>
              <CardDescription>Log restock shipments or waste items directly to unified inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <div className="space-y-1 z-20">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Select Product</label>
                  <CustomDropdown
                    options={productOptions}
                    value={stockForm.productId}
                    onChange={(v) => setStockForm(prev => ({ ...prev, productId: v }))}
                    placeholder="Select Product"
                    searchable={true}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Adjustment Quantity</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 15 for Restock, -5 for damage"
                      value={stockForm.delta === 0 ? '' : stockForm.delta}
                      onChange={(e) => setStockForm(prev => ({ ...prev, delta: Number(e.target.value) }))}
                      required
                    />
                    <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1 text-emerald-500">
                        <ArrowUpRight className="h-3 w-3" /> Positive = Restock
                      </span>
                      <span className="flex items-center gap-1 text-rose-500">
                        <ArrowDownRight className="h-3 w-3" /> Negative = Damage/Waste
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 z-20">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Adjustment Reason</label>
                  <CustomDropdown
                    options={reasonOptions}
                    value={stockForm.reason}
                    onChange={(v) => setStockForm(prev => ({ ...prev, reason: v }))}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('list')}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Confirm Adjust</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bulk' && (
          <Card className="max-w-xl mx-auto animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                CSV Catalog Bulk Import
              </CardTitle>
              <CardDescription>Simulate loading multi-sku updates into active store catalog databases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Upload Catalog CSV file</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Drag and drop file here, or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="mx-auto block text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-black file:uppercase file:bg-primary-500 file:text-white file:cursor-pointer"
                />
                {csvFile && (
                  <p className="mt-3 text-xs font-bold text-emerald-500">Selected file: {csvFile.name}</p>
                )}
              </div>

              <div className="bg-muted/40 p-4 rounded-xl border border-border">
                <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5" /> Expected CSV columns schema
                </h5>
                <code className="block text-[10px] mt-2 bg-background p-2.5 rounded-lg border border-border overflow-x-auto whitespace-pre">
                  name,brand,categoryId,unit,basePrice,sellingPrice,stock,lowStockAt,sku,barcode,rackLocation
                </code>
              </div>

              <form onSubmit={handleBulkUploadSubmit} className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setCsvFile(null); setActiveTab('list'); }}>Cancel</Button>
                <Button type="submit" variant="brand" size="sm" isLoading={uploading} loadingText="Importing Catalog...">
                  Execute Bulk Import
                </Button>
              </form>

            </CardContent>
          </Card>
        )}

      </div>
      
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Confirm Import"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
            <Button variant="brand" size="sm" onClick={confirmImportMaster} isLoading={importMasterProducts.isPending}>Import Now</Button>
          </div>
        }
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="flex gap-4 items-start p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="w-10 h-10 shrink-0 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                Import Master Catalog
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                This will automatically add all new master products into your store catalog. Products that already exist (matched by name, SKU, or barcode) will be skipped safely.
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Are you sure you want to proceed with the import?</p>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            deleteProductMutation.mutate({ productId: deletingProduct.id, storeId }, {
              onSuccess: () => {
                toast.success(`${deletingProduct.name} deleted successfully.`);
                setDeletingProduct(null);
              },
              onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to delete product');
              }
            });
          }
        }}
        title="Delete Product"
        description={`Are you sure you want to delete '${deletingProduct?.name}'? This will permanently remove the product from this store.`}
        requireTyping={false}
      />
    </div>
  );
}
