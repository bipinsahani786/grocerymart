import React, { useState } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { toast } from 'sonner';

interface StoreStockAdjustTabProps {
  products: any[];
  storeId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  adjustStockMutation: any;
}

const reasonOptions = [
  { value: 'Restocking', label: '🚚 Inward Restock Shipment' },
  { value: 'Damage / Expired', label: '⚠️ Damaged / Expired Goods' },
  { value: 'Audit Correction', label: '📋 Stock Count Audit Correction' },
  { value: 'Customer Return', label: '🔄 In-Store Customer Return' },
];

/**
 * Single Responsibility: Form presentation and submission for inventory stock level adjustments.
 */
export const StoreStockAdjustTab: React.FC<StoreStockAdjustTabProps> = ({
  products,
  storeId,
  onSuccess,
  onCancel,
  adjustStockMutation,
}) => {
  const [stockForm, setStockForm] = useState({
    productId: '',
    delta: '',
    reason: 'Restocking',
  });

  const productOptions = products.map((p: any) => ({
    value: p.id,
    label: `${p.name} (Cur: ${p.inventory?.[0]?.quantity ?? 0} ${p.unit}) - Bar: ${p.barcode || 'N/A'}`,
  }));

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deltaVal = Number(stockForm.delta);
    if (!stockForm.productId || isNaN(deltaVal) || deltaVal === 0) {
      toast.error('Please select a product and provide non-zero adjustment quantity!');
      return;
    }

    const selectedProduct = products.find((p: any) => p.id === stockForm.productId);
    const currentQty = selectedProduct?.inventory?.[0]?.quantity ?? 0;

    if (deltaVal < 0 && (currentQty + deltaVal) < 0) {
      toast.error(`Cannot deduct ${Math.abs(deltaVal)} items. Current stock is ${currentQty}. Stock quantity cannot drop below 0.`);
      return;
    }

    adjustStockMutation.mutate(
      { productId: stockForm.productId, delta: deltaVal, storeId },
      {
        onSuccess: () => {
          toast.success(`Inventory stock adjusted successfully!`);
          setStockForm({ productId: '', delta: '', reason: 'Restocking' });
          onSuccess();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to adjust stock');
        },
      }
    );
  };

  return (
    <Card className="max-w-md mx-auto animate-page-enter">
      <CardHeader>
        <CardTitle className="text-base font-black flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary-500" />
          Quick Stock Adjustment
        </CardTitle>
        <CardDescription>Log restock shipments or waste items directly to unified inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div className="space-y-1 z-20">
            <label className="text-xs font-bold text-muted-foreground uppercase">Select Product</label>
            <CustomDropdown
              options={productOptions}
              value={stockForm.productId}
              onChange={(v) => setStockForm(prev => ({ ...prev, productId: v }))}
              placeholder="Select Product"
              searchable={true}
              triggerClassName="h-[38px] !text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Adjustment Quantity</label>
            <div className="flex gap-2">
              <Input
                type="number"
                allowNegative={true}
                placeholder="e.g. 15 for Restock, -5 for damage"
                value={stockForm.delta}
                onChange={(e) => setStockForm(prev => ({ ...prev, delta: e.target.value }))}
                required
              />
              <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase">
                <span className="flex items-center gap-1 text-emerald-500">
                  <ArrowUpRight className="h-3 w-3" /> Positive = Restock
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <ArrowDownRight className="h-3 w-3" /> Negative = Damage/Waste
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 z-20">
            <label className="text-xs font-bold text-muted-foreground uppercase">Adjustment Reason</label>
            <CustomDropdown
              options={reasonOptions}
              value={stockForm.reason}
              onChange={(v) => setStockForm(prev => ({ ...prev, reason: v }))}
              triggerClassName="h-[38px] !text-xs font-semibold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="brand" size="sm" isLoading={adjustStockMutation.isPending}>Confirm Adjust</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
