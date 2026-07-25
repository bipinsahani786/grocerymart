import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { useTaxes } from '../api/useTaxes';
import type { TaxClass } from '../schemas/taxSchemas';

export function ScheduleRateModal({ isOpen, onClose, taxClass }: { isOpen: boolean; onClose: () => void, taxClass: TaxClass }) {
  const { scheduleTaxRate } = useTaxes();
  
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
    
    if (!effectiveFrom) return;

    const payload = {
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      components: components
        .filter(c => c.name && c.rate)
        .map(c => ({ name: c.name, rate: parseFloat(c.rate) }))
    };

    scheduleTaxRate.mutate({ taxClassId: taxClass.id, payload }, {
      onSuccess: () => {
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
      title={
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary-500" />
          <span>Schedule Rate for {taxClass.name}</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Effective From</label>
            <Input
              required
              type="datetime-local"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">The exact date and time when this new rate will automatically become active.</p>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Components</label>
          <div className="space-y-2">
            {components.map((comp) => (
              <div key={comp.id} className="flex gap-2 items-center">
                <Input
                  required
                  placeholder="e.g. CGST"
                  value={comp.name}
                  onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  required
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
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addComponent} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Component
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={scheduleTaxRate.isPending}>Schedule Rate</Button>
        </div>
      </form>
    </Modal>
  );
}
