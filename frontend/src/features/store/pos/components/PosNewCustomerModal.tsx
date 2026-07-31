import React from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PosNewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCustForm: { name: string; phone: string; email: string };
  setNewCustForm: React.Dispatch<React.SetStateAction<{ name: string; phone: string; email: string }>>;
  handleCreateCustomerSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function PosNewCustomerModal({
  isOpen,
  onClose,
  newCustForm,
  setNewCustForm,
  handleCreateCustomerSubmit,
  isLoading,
}: PosNewCustomerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary-500" />
          <span>Quick Register Customer</span>
        </div>
      }
      maxWidth="sm"
    >
      <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Customer Name *</label>
          <Input
            placeholder="e.g. Bipin Sahani"
            value={newCustForm.name}
            onChange={(e) => setNewCustForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Mobile Phone (10 Digits) *</label>
          <Input
            placeholder="e.g. 9876543210"
            maxLength={10}
            value={newCustForm.phone}
            onChange={(e) => setNewCustForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
          <Input
            type="email"
            placeholder="e.g. customer@gmail.com"
            value={newCustForm.email}
            onChange={(e) => setNewCustForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" size="sm" isLoading={isLoading} className="font-bold gap-1">
            <CheckCircle className="h-4 w-4" /> Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
