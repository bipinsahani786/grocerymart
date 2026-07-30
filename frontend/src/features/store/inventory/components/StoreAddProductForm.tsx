import React, { useState } from 'react';
import {
  Package,
  Building,
  Barcode,
  DollarSign,
  Archive,
  Tags,
  Activity,
  Layers,
  Tag,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Eye,
  Smartphone,
  Store,
  Truck,
  ShoppingBag,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import { toast } from 'sonner';
import { useCreateStoreProduct, useUploadStoreImage } from '@/features/store/api/useStorePanel';

export const unitOptions = [
  { value: 'pcs', label: 'Piece (pcs)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gm', label: 'Gram (gm)' },
  { value: 'ltr', label: 'Liter (ltr)' },
  { value: 'pack', label: 'Pack' },
];

export const productTypeOptions = [
  { value: 'simple', label: 'Simple Product' },
  { value: 'weighted', label: 'Weighted / Loose Item' },
  { value: 'variable', label: 'Variant Product' },
  { value: 'bundle', label: 'Combo / Bundle' },
  { value: 'perishable', label: 'Perishable Grocery' },
  { value: 'service', label: 'Service / Non-inventory' },
];

interface StoreAddProductFormProps {
  storeId: string;
  categories: any[];
  onCancel: () => void;
  onSuccess: () => void;
}

export function StoreAddProductForm({ storeId, categories, onCancel, onSuccess }: StoreAddProductFormProps) {
  const createProduct = useCreateStoreProduct();
  const uploadImageMutation = useUploadStoreImage();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    barcode: '',
    sku: '',
    productType: 'simple',
    unit: 'pcs',
    mrp: 0,
    sellingPrice: 0,
    costPrice: 0,
    quantity: 0,
    lowStockAlert: 5,
    rackLocation: '',
    hsnCode: '',
    description: '',
    imageUrls: [] as string[],
    showOnApp: true,
    showOnPOS: true,
    availableForDelivery: true,
    availableForClickCollect: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentCount = formData.imageUrls?.length || 0;
    if (currentCount >= 5) {
      toast.error('Maximum 5 images allowed per product');
      e.target.value = '';
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      imageUrls: [localPreviewUrl, ...(prev.imageUrls || [])]
    }));

    setIsUploadingImage(true);
    const fileData = new FormData();
    fileData.append('file', file);

    uploadImageMutation.mutate(fileData, {
      onSuccess: (data) => {
        if (data?.url) {
          setFormData(prev => ({
            ...prev,
            imageUrls: (prev.imageUrls || []).map(u => u === localPreviewUrl ? data.url : u)
          }));
          toast.success('Product image uploaded successfully');
        }
      },
      onError: (err: any) => {
        setFormData(prev => ({
          ...prev,
          imageUrls: (prev.imageUrls || []).filter(u => u !== localPreviewUrl)
        }));
        toast.error(err.response?.data?.message || 'Failed to upload image');
      },
      onSettled: () => {
        setIsUploadingImage(false);
      }
    });
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingImage) {
      toast.info('Please wait for product image upload to finish...');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Product title is required.');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a Category.');
      return;
    }
    if (!formData.barcode.trim()) {
      toast.error('Barcode is strictly required.');
      return;
    }
    if (formData.sellingPrice <= 0) {
      toast.error('Selling price must be greater than zero.');
      return;
    }
    if (formData.mrp > 0 && formData.sellingPrice > formData.mrp) {
      toast.error('Selling price cannot exceed MRP.');
      return;
    }

    // Strip transient blob preview URLs if any remain
    const cleanImageUrls = (formData.imageUrls || []).filter(url => !url.startsWith('blob:'));

    const payload = {
      ...formData,
      imageUrls: cleanImageUrls,
      basePrice: formData.sellingPrice,
      mrp: formData.mrp || 0,
      costPrice: formData.costPrice || 0,
      type: formData.productType,
      showOnline: formData.showOnApp,
      showPOS: formData.showOnPOS,
      deliveryEnabled: formData.availableForDelivery,
      clickCollectEnabled: formData.availableForClickCollect,
    };

    createProduct.mutate(
      { storeId, payload },
      {
        onSuccess: () => {
          toast.success(`Product "${formData.name}" created successfully!`);
          onSuccess();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create product.');
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-page-enter max-w-[1200px] mx-auto py-4">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-muted/50 rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
        </Button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" />
            Add New Store Product
          </h2>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Fill in the details below to add a new product directly to your store inventory.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      icon={<Package className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-1.5 z-30">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Store Category <span className="text-rose-500">*</span>
                    </label>
                    <CascadingCategoryDropdown
                      categories={categories}
                      value={formData.categoryId}
                      onChange={(val) => setFormData({ ...formData, categoryId: val })}
                      placeholder="Select Category"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Brand Name
                    </label>
                    <Input
                      placeholder="e.g. ITC / Fortune"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      icon={<Barcode className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      SKU (Stock Keeping Unit)
                    </label>
                    <Input
                      placeholder="Auto-generated if empty"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      icon={<Tags className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-1.5 z-20">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Product Type
                    </label>
                    <CustomDropdown
                      options={productTypeOptions}
                      value={formData.productType}
                      onChange={(val) => setFormData({ ...formData, productType: String(val) })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      HSN Code
                    </label>
                    <Input
                      placeholder="e.g. 1905"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      icon={<FileText className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Detailed specification or product notes..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Details */}
            <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
              <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Pricing & Profit Margin
                </h3>
              </div>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Selling Price <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice || ''}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
                      className="border-emerald-500/50 focus:border-emerald-500 ring-emerald-500/20 focus-visible:ring-emerald-500/20 font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      MRP (Retail Price)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.mrp || ''}
                      onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      icon={<Tag className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Cost Price (Purchase)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice || ''}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      icon={<Activity className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel & Feature Toggles */}
            <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
              <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Eye className="w-4 h-4 text-purple-500" />
                  Sales Channels & Visibility
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Mobile App / Online</p>
                        <p className="text-[10px] text-muted-foreground">Visible on consumer ordering app</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showOnApp}
                      onChange={(e) => setFormData({ ...formData, showOnApp: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">POS Counter System</p>
                        <p className="text-[10px] text-muted-foreground">Searchable at checkout counter</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showOnPOS}
                      onChange={(e) => setFormData({ ...formData, showOnPOS: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Express Home Delivery</p>
                        <p className="text-[10px] text-muted-foreground">Available for door delivery orders</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.availableForDelivery}
                      onChange={(e) => setFormData({ ...formData, availableForDelivery: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Click & Collect (Pickup)</p>
                        <p className="text-[10px] text-muted-foreground">Eligible for store counter pickup</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.availableForClickCollect}
                      onChange={(e) => setFormData({ ...formData, availableForClickCollect: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Image Gallery & Upload */}
            <Card className="border border-border/50 shadow-sm bg-card overflow-visible">
              <div className="bg-muted/30 px-6 py-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  Product Media
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  (formData.imageUrls?.length || 0) >= 5
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
                    : 'bg-muted text-slate-600 dark:text-slate-400 border-border'
                }`}>
                  {formData.imageUrls?.length || 0} / 5 Max
                </span>
              </div>
              <CardContent className="p-6 space-y-4">
                {formData.imageUrls && formData.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                        <SafeCategoryImage src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center gap-2 bg-muted/10">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-40" />
                    <p className="text-xs text-muted-foreground font-medium">No product images uploaded</p>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block">
                    <span className="sr-only">Choose image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage || (formData.imageUrls?.length || 0) >= 5}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950 dark:file:text-primary-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                  {(formData.imageUrls?.length || 0) >= 5 && (
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                      Maximum 5 images limit reached.
                    </p>
                  )}
                  {isUploadingImage && (
                    <p className="text-[10px] text-primary-500 font-medium mt-1 animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Settings */}
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
                    Initial Stock Quantity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
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
                    value={formData.lowStockAlert || ''}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) || 0 })}
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
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: String(val) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Rack Location
                  </label>
                  <Input
                    placeholder="e.g. Aisle B2-S1"
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
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
                disabled={createProduct.isPending || isUploadingImage}
              >
                {createProduct.isPending ? 'Saving Product...' : 'Create Store Product'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                className="w-full font-bold h-12 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
