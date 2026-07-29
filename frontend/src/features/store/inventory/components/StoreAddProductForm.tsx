import React, { useState } from 'react';
import { Package, Building, Barcode, DollarSign, Archive, Tags, Activity, Layers, Tag, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';
import { toast } from 'sonner';
import { useCreateStoreProduct } from '@/features/store/api/useStorePanel';

export const unitOptions = [
  { value: 'pcs', label: 'Piece (pcs)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gm', label: 'Gram (gm)' },
  { value: 'ltr', label: 'Liter (ltr)' },
  { value: 'pack', label: 'Pack' },
];

interface StoreAddProductFormProps {
  storeId: string;
  categories: any[];
  onCancel: () => void;
  onSuccess: () => void;
}

export function StoreAddProductForm({ storeId, categories, onCancel, onSuccess }: StoreAddProductFormProps) {
  const createProduct = useCreateStoreProduct();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    barcode: '',
    sku: '',
    type: 'simple',
    unit: 'pcs',
    mrp: 0,
    sellingPrice: 0,
    costPrice: 0,
    quantity: 0,
    lowStockAlert: 5,
    rackLocation: '',
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validations
    if (!formData.name.trim()) {
      toast.error('Product name is required.');
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

    const payload = {
      ...formData,
      mrp: formData.mrp || 0,
      costPrice: formData.costPrice || 0,
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
                      className="border-emerald-500/50 focus:border-emerald-500 ring-emerald-500/20 focus-visible:ring-emerald-500/20"
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
                      Cost Price (Base)
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
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? 'Saving...' : 'Create Store Product'}
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
