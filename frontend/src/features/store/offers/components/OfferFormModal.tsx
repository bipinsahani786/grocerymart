import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: any) => void;
  isSaving: boolean;
}

export function OfferFormModal({ isOpen, onClose, onSubmit, isSaving }: OfferFormModalProps) {
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'FLAT',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    endDate: '',
    usageLimit: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code: form.code.toUpperCase().replace(/\s+/g, ''),
      description: form.description,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue) || 0,
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      endDate: form.endDate || null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="md"
      title={
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-sm font-black">
          <Tag className="h-5 w-5 text-primary-500" />
          Configure Promo Coupon Code
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Coupon Code *</label>
            <Input 
              placeholder="e.g. FESTIVE200"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount Type *</label>
            <CustomDropdown
              options={[
                { value: 'FLAT', label: 'Flat Cash Discount (₹)' },
                { value: 'PERCENT', label: 'Percentage Cut (%)' }
              ]}
              value={form.discountType}
              onChange={(val) => setForm(prev => ({ ...prev, discountType: val }))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount Value *</label>
            <Input 
              type="number"
              min="1"
              placeholder="e.g. 200"
              value={form.discountValue}
              onChange={(e) => setForm(prev => ({ ...prev, discountValue: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Min Order Limit (₹)</label>
            <Input 
              type="number"
              min="0"
              placeholder="e.g. 1000"
              value={form.minOrderValue}
              onChange={(e) => setForm(prev => ({ ...prev, minOrderValue: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Discount Limit (For %)</label>
            <Input 
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={form.maxDiscount}
              onChange={(e) => setForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
              disabled={form.discountType === 'FLAT'}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiry Date</label>
            <div className="h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs font-semibold focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden">
              <CustomDatePicker
                value={form.endDate}
                onChange={(val) => setForm(prev => ({ ...prev, endDate: val }))}
                placeholder="Select expiry date"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Offer Description</label>
          <Input 
            placeholder="e.g. Flat ₹200 off on order total above ₹1000"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="text-xs uppercase font-extrabold h-9 rounded-lg"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="brand"
            disabled={isSaving}
            className="text-xs uppercase font-extrabold h-9 rounded-lg"
          >
            {isSaving ? 'Launching...' : 'Launch Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
