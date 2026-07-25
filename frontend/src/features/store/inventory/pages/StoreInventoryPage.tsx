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
  FolderOpen
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockStore, type Product } from '@/store/mockStore';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

type ActiveTab = 'list' | 'add' | 'edit' | 'stock' | 'bulk';

export default function StoreInventoryPage() {
  const { 
    products, 
    categories, 
    addProduct, 
    editProduct, 
    adjustStock 
  } = useMockStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Selected product for edit
  const [editingProductId, setEditingProductId] = useState<string>('');
  
  // Add Form State
  const [addForm, setAddForm] = useState({
    name: '',
    brand: '',
    categoryId: categories[0]?.id || '',
    unit: 'piece',
    basePrice: 0,
    sellingPrice: 0,
    stock: 0,
    lowStockAt: 5,
    sku: '',
    barcode: '',
    rackLocation: 'Aisle Main',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    categoryId: '',
    unit: 'piece',
    basePrice: 0,
    sellingPrice: 0,
    stock: 0,
    lowStockAt: 5,
    sku: '',
    barcode: '',
    rackLocation: '',
  });

  // Stock Form State
  const [stockForm, setStockForm] = useState({
    productId: products[0]?.id || '',
    delta: 0,
    reason: 'Restocking',
  });

  // Bulk Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Dropdown Option Mappings for CustomDropdown
  const categoryFilterOptions = useMemo(() => {
    return [
      { value: 'All', label: 'All Categories' },
      ...categories.map(c => ({ value: c.id, label: c.name }))
    ];
  }, [categories]);

  const formCategoryOptions = useMemo(() => {
    return categories.map(c => ({ value: c.id, label: c.name }));
  }, [categories]);

  const unitOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'L', label: 'Liter (L)' },
    { value: 'pack', label: 'Pack' }
  ];

  const productOptions = useMemo(() => {
    return products.map(p => ({
      value: p.id,
      label: `${p.name} (Current: ${p.stock})`
    }));
  }, [products]);

  const reasonOptions = [
    { value: 'Restocking', label: 'Restocking Shipment' },
    { value: 'Wastage / damaged', label: 'Wastage / damaged items' },
    { value: 'Audit discrepancy', label: 'Physical audit correction' },
    { value: 'Customer Return', label: 'Customer Return' }
  ];

  // 1. Filtered products for listing
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.barcode.includes(searchQuery);
      const matchesCategory = categoryFilter === 'All' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // 2. Set up edit form values
  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      unit: product.unit,
      basePrice: product.basePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      lowStockAt: product.lowStockAt,
      sku: product.sku,
      barcode: product.barcode,
      rackLocation: product.rackLocation,
    });
    setActiveTab('edit');
  };

  // 3. Form Submissions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.barcode) {
      toast.error('Product Name and Barcode are required!');
      return;
    }
    
    // Auto generate SKU if empty
    const finalSku = addForm.sku || addForm.name.toUpperCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random()*1000);

    addProduct({
      name: addForm.name,
      brand: addForm.brand,
      categoryId: addForm.categoryId,
      unit: addForm.unit,
      basePrice: Number(addForm.basePrice),
      sellingPrice: Number(addForm.sellingPrice),
      stock: Number(addForm.stock),
      lowStockAt: Number(addForm.lowStockAt),
      sku: finalSku,
      barcode: addForm.barcode,
      rackLocation: addForm.rackLocation,
      isActive: true
    });

    toast.success(`${addForm.name} added to catalog successfully!`);
    
    // Reset form
    setAddForm({
      name: '',
      brand: '',
      categoryId: categories[0]?.id || '',
      unit: 'piece',
      basePrice: 0,
      sellingPrice: 0,
      stock: 0,
      lowStockAt: 5,
      sku: '',
      barcode: '',
      rackLocation: 'Aisle Main',
    });
    
    setActiveTab('list');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    editProduct(editingProductId, {
      name: editForm.name,
      brand: editForm.brand,
      categoryId: editForm.categoryId,
      unit: editForm.unit,
      basePrice: Number(editForm.basePrice),
      sellingPrice: Number(editForm.sellingPrice),
      stock: Number(editForm.stock),
      lowStockAt: Number(editForm.lowStockAt),
      sku: editForm.sku,
      barcode: editForm.barcode,
      rackLocation: editForm.rackLocation,
    });

    toast.success('Product details updated successfully!');
    setActiveTab('list');
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deltaVal = Number(stockForm.delta);
    if (!stockForm.productId || deltaVal === 0) {
      toast.error('Please select a product and provide non-zero adjustment quantity!');
      return;
    }

    const prod = products.find(p => p.id === stockForm.productId);
    if (!prod) return;

    adjustStock(stockForm.productId, deltaVal, stockForm.reason);

    const isAdd = deltaVal > 0;
    toast.success(`Inventory stock adjusted!`, {
      description: `Stock level of ${prod.name} ${isAdd ? 'increased' : 'reduced'} by ${Math.abs(deltaVal)}. New Qty: ${Math.max(0, prod.stock + deltaVal)}`
    });

    // Reset stock delta
    setStockForm(prev => ({ ...prev, delta: 0 }));
    setActiveTab('list');
  };

  // 4. Simulated CSV upload
  const handleBulkUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setUploading(true);

    // Simulate bulk processing delay
    setTimeout(() => {
      // Inject some mock products representing catalog extensions
      addProduct({
        name: 'Cadbury Dairy Milk Silk 150g',
        brand: 'Cadbury',
        categoryId: 'cat-2',
        unit: 'piece',
        basePrice: 120,
        sellingPrice: 150,
        stock: 35,
        lowStockAt: 10,
        sku: 'CADBURY-SILK-150G',
        barcode: '8901058002444',
        rackLocation: 'Aisle A3-S4',
        isActive: true,
      });

      addProduct({
        name: 'Tropicana Orange Juice 1L',
        brand: 'Tropicana',
        categoryId: 'cat-3',
        unit: 'piece',
        basePrice: 85,
        sellingPrice: 110,
        stock: 24,
        lowStockAt: 8,
        sku: 'TROPICANA-ORANGE-1L',
        barcode: '8902001300055',
        rackLocation: 'Aisle B1-S2',
        isActive: true,
      });

      setUploading(false);
      setCsvFile(null);
      toast.success('Bulk import completed!', {
        description: 'Successfully parsed and added 2 new products to the store catalog.',
      });
      setActiveTab('list');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Boxes}
        title="Unified Store Inventory"
        subtitle="Manage product listings, SKU catalog parameters, stock updates, and bulk CSV uploads"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
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
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500 font-extrabold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'list' && (
          <div className="space-y-4 animate-page-enter">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
              <div className="relative flex-1 max-w-md">
                <Input 
                  icon={<Search className="h-4 w-4" />} 
                  placeholder="Search catalog by name, barcode or SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase">Filter Category:</span>
                <div className="w-[170px] z-20">
                  <CustomDropdown
                    options={categoryFilterOptions}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
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
                      filteredProducts.map(p => {
                        const catName = categories.find(c => c.id === p.categoryId)?.name || 'Unknown';
                        const isLowStock = p.stock <= p.lowStockAt;
                        return (
                          <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800 dark:text-white">{p.barcode}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{p.sku}</p>
                            </td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {p.name}
                              <span className="text-[10px] font-semibold text-muted-foreground ml-1.5">({p.unit})</span>
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleStartEdit(p)}
                              >
                                <Edit3 className="h-4 w-4 text-primary-500" />
                              </Button>
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
          <Card className="max-w-2xl mx-auto animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Add New Product to Store</CardTitle>
              <CardDescription>Specify catalog parameters to instantly propagate to POS and online apps.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Product Name *</label>
                    <Input 
                      placeholder="e.g. Kurkure Green Chutney 26g"
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Brand Name</label>
                    <Input 
                      placeholder="e.g. Pepsico"
                      value={addForm.brand}
                      onChange={(e) => setAddForm(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Category *</label>
                    <CustomDropdown
                      options={formCategoryOptions}
                      value={addForm.categoryId}
                      onChange={(v) => setAddForm(prev => ({ ...prev, categoryId: v }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Selling Unit</label>
                    <CustomDropdown
                      options={unitOptions}
                      value={addForm.unit}
                      onChange={(v) => setAddForm(prev => ({ ...prev, unit: v }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Barcode (EAN/UPC) *</label>
                    <Input 
                      placeholder="e.g. 8901058002315"
                      value={addForm.barcode}
                      onChange={(e) => setAddForm(prev => ({ ...prev, barcode: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Cost Price (Base)</label>
                    <Input 
                      type="number"
                      value={addForm.basePrice}
                      onChange={(e) => setAddForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Selling Price *</label>
                    <Input 
                      type="number"
                      value={addForm.sellingPrice}
                      onChange={(e) => setAddForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Initial Qty</label>
                    <Input 
                      type="number"
                      value={addForm.stock}
                      onChange={(e) => setAddForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Low Threshold</label>
                    <Input 
                      type="number"
                      value={addForm.lowStockAt}
                      onChange={(e) => setAddForm(prev => ({ ...prev, lowStockAt: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">SKU (Auto-gen if empty)</label>
                    <Input 
                      placeholder="e.g. LAYS-CLASSIC-GREEN"
                      value={addForm.sku}
                      onChange={(e) => setAddForm(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Physical Rack Location</label>
                    <Input 
                      placeholder="e.g. Aisle B2-S1"
                      value={addForm.rackLocation}
                      onChange={(e) => setAddForm(prev => ({ ...prev, rackLocation: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('list')}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Save Product</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'edit' && (
          <Card className="max-w-2xl mx-auto animate-page-enter">
            <CardHeader>
              <CardTitle className="text-base font-black">Edit Product: {editForm.name}</CardTitle>
              <CardDescription>Adjust properties of an existing catalog product record.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Product Name</label>
                    <Input 
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Brand Name</label>
                    <Input 
                      value={editForm.brand}
                      onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                    <CustomDropdown
                      options={formCategoryOptions}
                      value={editForm.categoryId}
                      onChange={(v) => setEditForm(prev => ({ ...prev, categoryId: v }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1 z-20">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Selling Unit</label>
                    <CustomDropdown
                      options={unitOptions}
                      value={editForm.unit}
                      onChange={(v) => setEditForm(prev => ({ ...prev, unit: v }))}
                      triggerClassName="h-[38px] !text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Barcode (EAN/UPC)</label>
                    <Input 
                      value={editForm.barcode}
                      onChange={(e) => setEditForm(prev => ({ ...prev, barcode: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Cost Price (Base)</label>
                    <Input 
                      type="number"
                      value={editForm.basePrice}
                      onChange={(e) => setEditForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Selling Price</label>
                    <Input 
                      type="number"
                      value={editForm.sellingPrice}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Current Stock Qty</label>
                    <Input 
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Low Threshold</label>
                    <Input 
                      type="number"
                      value={editForm.lowStockAt}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lowStockAt: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">SKU</label>
                    <Input 
                      value={editForm.sku}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Physical Rack Location</label>
                    <Input 
                      value={editForm.rackLocation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, rackLocation: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('list')}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Update Product</Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
    </div>
  );
}
