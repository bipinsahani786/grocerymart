import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Edit, CheckCircle2 } from 'lucide-react';
import { useTaxes } from '../api/useTaxes';
import type { TaxClass } from '../schemas/taxSchemas';

interface EditTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxClass: TaxClass | null;
}

export function EditTaxModal({ isOpen, onClose, taxClass }: EditTaxModalProps) {
  const { updateTaxClass } = useTaxes();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (taxClass) {
      setName(taxClass.name || '');
      setDescription(taxClass.description || '');
      setIsActive(taxClass.isActive !== false);
    }
  }, [taxClass]);

  if (!taxClass) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaxClass.mutate(
      {
        id: taxClass.id,
        payload: {
          name,
          description: description || null,
          isActive,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-500">
            <Edit className="w-4 h-4" />
          </div>
          <span>Edit Tax Profile: {taxClass.name}</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tax Profile Name <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Standard GST 18%, Dairy Tax"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Percent className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Description (Optional)
            </label>
            <Input
              placeholder="What products does this apply to?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Profile Status
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isActive
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose} className="h-9 px-4 text-xs font-semibold">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateTaxClass.isPending}
            className="h-9 px-5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditTaxModal;
