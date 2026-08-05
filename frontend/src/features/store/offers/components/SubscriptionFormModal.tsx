import React, { useState } from 'react';
import { Award, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subData: any) => void;
  isSaving: boolean;
}

export function SubscriptionFormModal({ isOpen, onClose, onSubmit, isSaving }: SubscriptionFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '30',
    featureInput: '',
    features: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      durationDays: parseInt(form.durationDays) || 30,
      features: form.features,
    });
  };

  const addFeature = () => {
    if (!form.featureInput.trim()) return;
    setForm(prev => ({
      ...prev,
      features: [...prev.features, prev.featureInput.trim()],
      featureInput: ''
    }));
  };

  const removeFeature = (idx: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="md"
      title={
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-sm font-black text-purple-600 dark:text-purple-400">
          <Award className="h-5 w-5" />
          Create VIP Membership Pass
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Club / Plan Name *</label>
            <Input 
              placeholder="e.g. VIP Elite Club"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Plan Price *</label>
            <Input 
              type="number"
              min="0"
              placeholder="e.g. 199"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Duration (Days) *</label>
            <CustomDropdown
              options={[
                { value: '30', label: 'Monthly Pass (30 Days)' },
                { value: '90', label: 'Quarterly Pass (90 Days)' },
                { value: '365', label: 'Yearly membership (365 Days)' }
              ]}
              value={form.durationDays}
              onChange={(val) => setForm(prev => ({ ...prev, durationDays: val }))}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
            <Input 
              placeholder="e.g. Get zero shipping fees & extra cashback"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Bullet benefits list section */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">Add Included Plan Benefits / Features</label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Free home delivery on orders > ₹199"
              value={form.featureInput}
              onChange={(e) => setForm(prev => ({ ...prev, featureInput: e.target.value }))}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addFeature}
              variant="outline"
              className="text-xs uppercase font-extrabold h-9 rounded-lg"
            >
              Add Benefit
            </Button>
          </div>

          {form.features.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border space-y-2">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Plan Features Preview:</span>
              <div className="flex flex-wrap gap-1.5">
                {form.features.map((feat, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-900/30 rounded-lg">
                    {feat}
                    <button type="button" onClick={() => removeFeature(idx)} className="text-purple-400 hover:text-purple-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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
            {isSaving ? 'Creating...' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
