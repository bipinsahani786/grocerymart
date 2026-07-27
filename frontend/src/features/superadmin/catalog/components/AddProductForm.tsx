import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import {
  Trash2,
  Plus,
  UploadCloud,
  Loader2,
  Package,
  Layers,
  Scale,
  X,
  Tag,
  DollarSign,
  Barcode,
  Building,
} from 'lucide-react';
import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterProduct } from '../schemas/catalogSchemas';
import { toast } from 'sonner';

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<MasterProduct>;
}

export function AddProductForm({ onSuccess, onCancel, initialData }: AddProductFormProps) {
  const { flatCategories, createProduct, uploadImage } = useMasterCatalog();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<MasterProduct>>({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    categoryId: initialData?.categoryId || '',
    productType: initialData?.productType || 'simple',
    unit: initialData?.unit || 'pcs',
    basePrice: initialData?.basePrice || 0,
    mrp: initialData?.mrp || 0,
    barcode: initialData?.barcode || '',
    imageUrls: initialData?.imageUrls || [],
    variants: initialData?.variants || [],
  });

  const categoryOptions = [
    { value: '', label: 'Select Master Category' },
    ...flatCategories.map((c) => ({
      value: c.id!,
      label: c.name,
    })),
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const url = await uploadImage.mutateAsync(files[0]);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), url],
      }));
      toast.success('Product image uploaded successfully');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { name: '', price: 0, mrp: 0, barcode: '', imageUrl: null },
      ],
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a master category.');
      return;
    }
    if (
      formData.productType === 'variant' &&
      (!formData.variants || formData.variants.length === 0)
    ) {
      toast.error('Please add at least one variant for a variant product.');
      return;
    }

    createProduct.mutate(formData as MasterProduct, {
      onSuccess: () => {
        toast.success('Master product created successfully!');
        onSuccess();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm"
    >
      {/* ── Section 1: Basic Information ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shadow-xs">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Basic Product Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide global title, brand, and category taxonomy assignment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aashirvaad Whole Wheat Atta"
              icon={<Package className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Brand Name
            </label>
            <Input
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. ITC / Fortune"
              icon={<Building className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Master Category <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={categoryOptions}
              value={formData.categoryId || ''}
              onChange={(val) => setFormData({ ...formData, categoryId: String(val) })}
              placeholder="Select Category"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Product Classification & Pricing ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shadow-xs">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Type, Unit & Pricing Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select product type (Simple, Variant, or Loose) and set base price.
            </p>
          </div>
        </div>

        {/* Product Type Cards Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              type: 'simple',
              title: 'Simple Product',
              desc: 'Single SKU with fixed unit & barcode',
              icon: Package,
            },
            {
              type: 'variant',
              title: 'Variant Product',
              desc: 'Multiple sizes, weights, or options',
              icon: Layers,
            },
            {
              type: 'loose',
              title: 'Loose / Weight Item',
              desc: 'Weighed at POS (kg, gm, liter)',
              icon: Scale,
            },
          ].map(({ type, title, desc, icon: Icon }) => {
            const isSelected = formData.productType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    productType: type as any,
                    variants: [],
                  })
                }
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-500/10 ring-2 ring-primary-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <input
                    type="radio"
                    name="productType"
                    checked={isSelected}
                    onChange={() => {}}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                    {title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Type Config Panels */}
        {formData.productType === 'simple' && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Unit (e.g. 1kg, 500g, 1pcs) <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 1kg"
                icon={<Tag className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Base Price (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.basePrice || ''}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                MRP (Maximum Retail Price)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.mrp || ''}
                onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Barcode / EAN
              </label>
              <Input
                value={formData.barcode || ''}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="8901234567890"
                icon={<Barcode className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>
        )}

        {formData.productType === 'loose' && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Measuring Unit <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-900 dark:text-white"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Gram (gm)</option>
                <option value="ltr">Liter (ltr)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Base Price per unit (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.basePrice || ''}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 p-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              Note: Loose items do not require fixed barcodes. The POS system automatically calculates total price based on item weight during checkout.
            </div>
          </div>
        )}

        {formData.productType === 'variant' && (
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Product Variants Table
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs font-bold border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-900/50 dark:text-primary-400 cursor-pointer"
                onClick={addVariantRow}
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant Row
              </Button>
            </div>

            <div className="space-y-2">
              {formData.variants?.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-xs"
                >
                  <Input
                    required
                    placeholder="Variant Name (e.g. 500g Pack)"
                    value={v.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    required
                    placeholder="Price (₹)"
                    value={v.price || ''}
                    onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="MRP (₹)"
                    value={v.mrp || ''}
                    onChange={(e) => updateVariant(idx, 'mrp', parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Barcode"
                      value={v.barcode || ''}
                      onChange={(e) => updateVariant(idx, 'barcode', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 h-9 w-9"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 3: Product Image Media Upload ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shadow-xs">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Product Image Gallery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload product photos displayed across stores and customer catalog.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex gap-4 flex-wrap">
            {formData.imageUrls?.map((url, idx) => (
              <div
                key={idx}
                className="relative w-28 h-28 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden shadow-xs group"
              >
                <SafeCategoryImage
                  src={url}
                  alt={`Product Preview ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  iconSize="w-6 h-6"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrls: prev.imageUrls?.filter((_, i) => i !== idx),
                    }))
                  }
                  className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-all cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-28 h-28 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl cursor-pointer bg-white dark:bg-zinc-900 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all shadow-2xs group">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              ) : (
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
              )}
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── Form Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="font-semibold text-xs h-10 px-5 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={createProduct.isPending}
          disabled={isUploading}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs h-10 px-6 cursor-pointer shadow-sm"
        >
          Save Master Product
        </Button>
      </div>
    </form>
  );
}

export default AddProductForm;
