import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  PenLine, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Smartphone,
  Printer,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { 
  useStoreInventory, 
  useStoreCategories, 
  useCreateStoreProduct, 
  useUpdateStoreProduct, 
  useDeleteStoreProduct, 
  useAdjustStoreStock,
  useImportMasterProducts
} from '@/features/store/api/useStorePanel';

export default function StoreProductsPage() {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId') || undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    categoryName: '',
    basePrice: '',
    mrp: '',
    quantity: '10',
    lowStockAlert: '5',
    unit: 'pcs',
    barcode: '',
    sku: '',
    brand: '',
    imageUrl: '',
    showOnApp: true,
    showOnPOS: true,
  });

  // Product Delete & Import Modal State
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // React Query Data Hooks
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useStoreInventory(storeId, searchQuery);
  const { data: categories = [] } = useStoreCategories(storeId);

  // React Query Mutations
  const createProduct = useCreateStoreProduct();
  const updateProduct = useUpdateStoreProduct();
  const deleteProduct = useDeleteStoreProduct();
  const adjustStock = useAdjustStoreStock();
  const importMasterProducts = useImportMasterProducts();

  const handleImportMaster = () => {
    importMasterProducts.mutate(
      { storeId },
      {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Master products imported successfully!');
          setIsImportModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to import master products');
        },
      }
    );
  };

  // Category Dropdown Options
  const categoryFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Categories' }];
    categories.forEach((cat: any) => {
      list.push({ value: cat.id, label: cat.name });
    });
    return list;
  }, [categories]);

  const categoryFormOptions = useMemo(() => {
    return categories.map((cat: any) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const stockFilterOptions = [
    { value: 'ALL', label: 'All Stock Levels' },
    { value: 'IN_STOCK', label: 'In Stock (> 5)' },
    { value: 'LOW_STOCK', label: 'Low Stock Alert (1 - 5)' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock (0)' },
  ];

  const unitOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gm', label: 'Gram (gm)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'pack', label: 'Pack' },
    { value: 'box', label: 'Box' },
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod: any) => {
      // Category filter
      if (selectedCategoryFilter !== 'ALL') {
        if (prod.categoryId !== selectedCategoryFilter && prod.category?.id !== selectedCategoryFilter) {
          return false;
        }
      }
      // Stock status filter
      const qty = prod.inventory?.[0]?.quantity ?? 0;
      const lowAt = prod.inventory?.[0]?.lowStockAt ?? 5;
      if (stockStatusFilter === 'OUT_OF_STOCK' && qty > 0) return false;
      if (stockStatusFilter === 'LOW_STOCK' && (qty === 0 || qty > lowAt)) return false;
      if (stockStatusFilter === 'IN_STOCK' && qty <= lowAt) return false;

      return true;
    });
  }, [products, selectedCategoryFilter, stockStatusFilter]);

  // Quick Metrics
  const stats = useMemo(() => {
    const total = products.length;
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;
    products.forEach((p: any) => {
      const q = p.inventory?.[0]?.quantity ?? 0;
      const l = p.inventory?.[0]?.lowStockAt ?? 5;
      if (q === 0) outOfStock++;
      else if (q <= l) lowStock++;
      else inStock++;
    });
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Product Form Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      categoryId: categories[0]?.id || '',
      categoryName: '',
      basePrice: '',
      mrp: '',
      quantity: '10',
      lowStockAlert: '5',
      unit: 'pcs',
      barcode: '',
      sku: '',
      brand: '',
      imageUrl: '',
      showOnApp: true,
      showOnPOS: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    const qty = prod.inventory?.[0]?.quantity ?? 0;
    const lowAt = prod.inventory?.[0]?.lowStockAt ?? 5;
    setProductForm({
      name: prod.name || '',
      categoryId: prod.categoryId || prod.category?.id || '',
      categoryName: prod.category?.name || '',
      basePrice: String(prod.basePrice || ''),
      mrp: String(prod.mrp || ''),
      quantity: String(qty),
      lowStockAlert: String(lowAt),
      unit: prod.unit || 'pcs',
      barcode: prod.barcode || '',
      sku: prod.sku || '',
      brand: prod.brand || '',
      imageUrl: prod.imageUrls?.[0] || '',
      showOnApp: prod.showOnApp !== false,
      showOnPOS: prod.showOnPOS !== false,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error('Product name is required!');
      return;
    }
    if (!productForm.basePrice || parseFloat(productForm.basePrice) <= 0) {
      toast.error('Selling price must be greater than 0');
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      categoryId: productForm.categoryId || undefined,
      basePrice: parseFloat(productForm.basePrice),
      mrp: productForm.mrp ? parseFloat(productForm.mrp) : undefined,
      quantity: parseInt(productForm.quantity || '0'),
      lowStockAlert: parseInt(productForm.lowStockAlert || '5'),
      unit: productForm.unit,
      barcode: productForm.barcode.trim() || undefined,
      sku: productForm.sku.trim() || undefined,
      brand: productForm.brand.trim() || undefined,
      imageUrls: productForm.imageUrl.trim() ? [productForm.imageUrl.trim()] : [],
      showOnApp: productForm.showOnApp,
      showOnPOS: productForm.showOnPOS,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { productId: editingProduct.id, storeId, payload },
        {
          onSuccess: () => {
            toast.success(`Product '${productForm.name}' updated successfully!`);
            setIsProductModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to update product');
          },
        }
      );
    } else {
      createProduct.mutate(
        { storeId, payload },
        {
          onSuccess: () => {
            toast.success(`Product '${productForm.name}' created successfully!`);
            setIsProductModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to create product');
          },
        }
      );
    }
  };

  const handleDeleteProductConfirm = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(
      { productId: deletingProduct.id, storeId },
      {
        onSuccess: () => {
          toast.success(`Product '${deletingProduct.name}' deleted successfully!`);
          setDeletingProduct(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to delete product');
        },
      }
    );
  };

  const handleQuickStockAdjust = (productId: string, delta: number) => {
    adjustStock.mutate(
      { productId, delta, storeId },
      {
        onSuccess: () => {
          toast.success(`Stock level adjusted (${delta > 0 ? '+' : ''}${delta})`);
        },
      }
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          Store Catalog & Product Master
        </h1>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetchProducts()}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh DB
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsImportModalOpen(true)}
            className="font-bold text-xs gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            Import Master Products
          </Button>

          <Button 
            variant="brand" 
            size="sm" 
            onClick={handleOpenCreateProduct} 
            className="font-bold text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* KPI Cards using CustomKpiCard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <CustomKpiCard
          title="Total Products"
          value={stats.total}
          subtitle="Total listed items"
          icon={<Package className="w-5 h-5" />}
          colorClass="bg-primary-500"
        />
        <CustomKpiCard
          title="In Stock Items"
          value={stats.inStock}
          subtitle="Ready for order"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorClass="bg-emerald-600"
        />
        <CustomKpiCard
          title="Low Stock Alert"
          value={stats.lowStock}
          subtitle="Items needing reorder"
          icon={<AlertTriangle className="w-5 h-5" />}
          colorClass="bg-amber-500"
        />
        <CustomKpiCard
          title="Out of Stock"
          value={stats.outOfStock}
          subtitle="Zero quantity in store"
          icon={<X className="w-5 h-5" />}
          colorClass="bg-rose-500"
        />
      </div>

      {/* PRODUCTS CATALOGUE */}
      <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-[200px] z-30">
              <CustomDropdown
                options={categoryFilterOptions}
                value={selectedCategoryFilter}
                onChange={setSelectedCategoryFilter}
                triggerClassName="h-9 !text-xs font-semibold"
              />
            </div>

            <div className="w-full sm:w-[200px] z-20">
              <CustomDropdown
                options={stockFilterOptions}
                value={stockStatusFilter}
                onChange={setStockStatusFilter}
                triggerClassName="h-9 !text-xs font-semibold"
              />
            </div>
          </div>

          {/* Products Table Card */}
          <Card className="overflow-visible relative z-10">
            <CardContent className="p-0 overflow-x-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No products found matching your search and filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Price / MRP</th>
                      <th className="p-4 text-center">In Stock</th>
                      <th className="p-4 text-center">Channels</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredProducts.map((prod: any) => {
                      const qty = prod.inventory?.[0]?.quantity ?? 0;
                      const lowAt = prod.inventory?.[0]?.lowStockAt ?? 5;
                      const categoryName = prod.category?.name || 'Uncategorized';
                      const image = prod.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop';

                      return (
                        <tr key={prod.id} className="hover:bg-muted/10">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={image} 
                                alt={prod.name} 
                                className="h-10 w-10 rounded-lg object-cover border border-border shrink-0 bg-muted"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop';
                                }}
                              />
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{prod.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                  {prod.brand && <span>Brand: {prod.brand}</span>}
                                  {prod.barcode && <span>Barcode: {prod.barcode}</span>}
                                  <span>Unit: {prod.unit || 'pcs'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {categoryName}
                            </Badge>
                          </td>

                          <td className="p-4 text-right">
                            <div className="font-black text-slate-900 dark:text-white text-xs">
                              ₹{prod.basePrice?.toFixed(2) || '0.00'}
                            </div>
                            {prod.mrp && prod.mrp > prod.basePrice && (
                              <div className="text-[10px] text-muted-foreground line-through">
                                ₹{prod.mrp.toFixed(2)}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleQuickStockAdjust(prod.id, -1)}
                                className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted font-bold text-xs"
                                title="Decrease stock by 1"
                              >
                                -
                              </button>
                              <span className={`font-black text-xs px-2 py-0.5 rounded ${
                                qty === 0 
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                                  : qty <= lowAt 
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {qty} {prod.unit || 'pcs'}
                              </span>
                              <button
                                onClick={() => handleQuickStockAdjust(prod.id, 1)}
                                className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted font-bold text-xs"
                                title="Increase stock by 1"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {prod.showOnApp !== false && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 border-blue-500/30 text-blue-600 dark:text-blue-400">
                                  <Smartphone className="h-2.5 w-2.5 mr-0.5 inline" /> App
                                </Badge>
                              )}
                              {prod.showOnPOS !== false && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 border-purple-500/30 text-purple-600 dark:text-purple-400">
                                  <Printer className="h-2.5 w-2.5 mr-0.5 inline" /> POS
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="h-7 w-7 p-0"
                                title="Edit Product"
                              >
                                <PenLine className="h-3.5 w-3.5 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingProduct(prod)}
                                className="h-7 w-7 p-0 hover:text-rose-600"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl animate-in fade-in-50 zoom-in-95 my-8 relative">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-black">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {editingProduct ? 'Update product pricing, stock level, and category details' : 'Enter product details to list in store catalog'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsProductModalOpen(false)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Product Name *</label>
                  <Input
                    placeholder="e.g. Amul Taaza Fresh Milk 1L"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 z-30">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Category *</label>
                    <CustomDropdown
                      options={categoryFormOptions}
                      value={productForm.categoryId}
                      onChange={(v) => setProductForm(prev => ({ ...prev, categoryId: v }))}
                      placeholder="Select Category"
                      triggerClassName="h-9 !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Unit *</label>
                    <CustomDropdown
                      options={unitOptions}
                      value={productForm.unit}
                      onChange={(v) => setProductForm(prev => ({ ...prev, unit: v }))}
                      triggerClassName="h-9 !text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Selling Price (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 68.00"
                      value={productForm.basePrice}
                      onChange={(e) => setProductForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">MRP (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 72.00"
                      value={productForm.mrp}
                      onChange={(e) => setProductForm(prev => ({ ...prev, mrp: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Initial Quantity *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Low Stock Alert Limit</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      value={productForm.lowStockAlert}
                      onChange={(e) => setProductForm(prev => ({ ...prev, lowStockAlert: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Barcode / EAN</label>
                    <Input
                      placeholder="e.g. 8901234567890"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Brand</label>
                    <Input
                      placeholder="e.g. Amul"
                      value={productForm.brand}
                      onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Image URL (Optional)</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.showOnApp}
                        onChange={(e) => setProductForm(prev => ({ ...prev, showOnApp: e.target.checked }))}
                        className="rounded accent-primary-600"
                      />
                      Show on Mobile App
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.showOnPOS}
                        onChange={(e) => setProductForm(prev => ({ ...prev, showOnPOS: e.target.checked }))}
                        className="rounded accent-primary-600"
                      />
                      Show on POS Counter
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsProductModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" size="sm" disabled={createProduct.isPending || updateProduct.isPending}>
                    {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProductConfirm}
        title="Delete Product"
        description={`Are you sure you want to remove '${deletingProduct?.name}' from the store catalog? This action cannot be undone.`}
      />

      {/* IMPORT MASTER PRODUCTS CONFIRM MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-background border-border shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-500" />
                Import Master Products
              </CardTitle>
              <CardDescription className="text-xs">
                Copy all master products and categories from the admin catalog into your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to import all master products into your store catalog? Unlisted products and missing categories will be copied automatically without overwriting existing store pricing.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="brand" 
                  size="sm" 
                  onClick={handleImportMaster}
                  disabled={importMasterProducts.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {importMasterProducts.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Confirm & Import Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
