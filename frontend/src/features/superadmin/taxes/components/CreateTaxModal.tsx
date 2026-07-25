import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useTaxes } from '../api/useTaxes';

export function CreateTaxModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createTaxClass } = useTaxes();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Initial Rate State
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [components, setComponents] = useState([{ id: '1', name: 'CGST', rate: '' }, { id: '2', name: 'SGST', rate: '' }]);

  const addComponent = () => {
    setComponents([...components, { id: Math.random().toString(), name: '', rate: '' }]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateComponent = (id: string, field: 'name' | 'rate', value: string) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let initialRate;
    if (effectiveFrom && components.some(c => c.name && c.rate)) {
      initialRate = {
        effectiveFrom: new Date(effectiveFrom).toISOString(),
        components: components
          .filter(c => c.name && c.rate)
          .map(c => ({ name: c.name, rate: parseFloat(c.rate) }))
      };
    }

    createTaxClass.mutate({ name, description, initialRate }, {
      onSuccess: () => {
        setName('');
        setDescription('');
        setEffectiveFrom('');
        setComponents([{ id: '1', name: 'CGST', rate: '' }, { id: '2', name: 'SGST', rate: '' }]);
        onClose();
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tax Profile"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Profile Name</label>
            <Input
              required
              placeholder="e.g. Standard GST 18%, Dairy Tax"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional)</label>
            <Input
              placeholder="What products does this apply to?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
          <div>
            <h4 className="font-semibold text-sm">Initial Tax Rate (Optional)</h4>
            <p className="text-xs text-slate-500 mb-4">Set the current rate for this profile.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Effective From</label>
            <Input
              type="datetime-local"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Components</label>
            {components.map((comp) => (
              <div key={comp.id} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. CGST"
                  value={comp.name}
                  onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="%"
                  value={comp.rate}
                  onChange={(e) => updateComponent(comp.id, 'rate', e.target.value)}
                  className="w-24"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeComponent(comp.id)}
                  disabled={components.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addComponent} className="w-full border-dashed mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add Component
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createTaxClass.isPending}>Create Profile</Button>
        </div>
      </form>
    </Modal>
  );
}
