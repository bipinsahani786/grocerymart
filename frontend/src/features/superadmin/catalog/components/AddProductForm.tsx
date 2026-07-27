import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, UploadCloud, Loader2 } from 'lucide-react';
import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterProduct } from '../schemas/catalogSchemas';

export function AddProductForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const { flatCategories, createProduct, uploadImage } = useMasterCatalog();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<MasterProduct>>({
    name: '',
    brand: '',
    categoryId: '',
    productType: 'simple',
    unit: 'pcs',
    basePrice: 0,
    mrp: 0,
    barcode: '',
    imageUrls: [],
    variants: [],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      // For MVP, just upload first file. Production could do multiple concurrent uploads.
      const url = await uploadImage.mutateAsync(files[0]);
      setFormData(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), url] }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Check console.');
    } finally {
      setIsUploading(false);
    }
  };

  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { name: '', price: 0, mrp: 0, barcode: '', imageUrl: null }]
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productType === 'variant' && (!formData.variants || formData.variants.length === 0)) {
      alert('Please add at least one variant.');
      return;
    }
    createProduct.mutate(formData as MasterProduct, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-white/10">
      
      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">1. Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Product Name *</label>
            <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Aashirvaad Atta" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Brand</label>
            <Input value={formData.brand || ''} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="e.g. ITC" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Master Category *</label>
            <select 
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Category</option>
              {flatCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-white/10" />

      {/* 2. Product Type & Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">2. Product Type & Details</h3>
        
        <div className="flex gap-6 mb-4">
          {['simple', 'variant', 'loose'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="productType" 
                value={type} 
                checked={formData.productType === type}
                onChange={() => setFormData({...formData, productType: type as any, variants: []})}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>

        {formData.productType === 'simple' && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Unit (e.g. 1kg, 1pcs)</label>
              <Input required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="1kg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Base Price (Cost) *</label>
              <Input type="number" required min="0" step="0.01" value={formData.basePrice || ''} onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">MRP</label>
              <Input type="number" min="0" step="0.01" value={formData.mrp || ''} onChange={(e) => setFormData({...formData, mrp: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Barcode</label>
              <Input value={formData.barcode || ''} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
            </div>
          </div>
        )}

        {formData.productType === 'loose' && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Measuring Unit *</label>
              <select 
                required
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Gram (gm)</option>
                <option value="ltr">Liter (ltr)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Price per unit *</label>
              <Input type="number" required min="0" step="0.01" value={formData.basePrice || ''} onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1.5 pt-6 text-sm text-slate-500">
              Note: Loose items do not have barcodes. POS handles weighing.
            </div>
          </div>
        )}

        {formData.productType === 'variant' && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Variants (e.g. Size/Color/Weight)</div>
            
            <div className="space-y-2">
              {formData.variants?.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <Input required placeholder="Variant Name (e.g. Red-M)" value={v.name} onChange={(e) => updateVariant(idx, 'name', e.target.value)} />
                  <Input type="number" required placeholder="Price" value={v.price || ''} onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))} />
                  <Input type="number" placeholder="MRP" value={v.mrp || ''} onChange={(e) => updateVariant(idx, 'mrp', parseFloat(e.target.value))} />
                  <Input placeholder="Barcode" value={v.barcode || ''} onChange={(e) => updateVariant(idx, 'barcode', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => removeVariant(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-1 mt-2" onClick={addVariantRow}>
              <Plus className="w-4 h-4" /> Add Variant Row
            </Button>
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-white/10" />

      {/* 3. Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">3. Product Images</h3>
        
        <div className="flex gap-4 flex-wrap">
          {formData.imageUrls?.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls?.filter((_, i) => i !== idx) }))}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
              >✕</button>
            </div>
          ))}
          
          <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary-500" /> : <UploadCloud className="w-5 h-5 text-slate-400" />}
            <span className="text-[10px] text-slate-500 font-medium">Upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={createProduct.isPending} disabled={isUploading}>Save Master Product</Button>
      </div>

    </form>
  );
}
