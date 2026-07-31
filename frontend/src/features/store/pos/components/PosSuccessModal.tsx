import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PosSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedOrder: any;
  onDownloadPdf: () => void;
}

export function PosSuccessModal({
  isOpen,
  onClose,
  completedOrder,
  onDownloadPdf,
}: PosSuccessModalProps) {
  if (!completedOrder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
          <span className="font-extrabold text-lg">POS Sale Completed Successfully!</span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-5 py-2">
        {/* Order Success Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Order Reference
              </p>
              <h3 className="text-lg font-black font-mono text-foreground">
                {completedOrder.orderNumber || `POS-${completedOrder.id?.slice(-6)}`}
              </h3>
            </div>
            <Badge variant="success" className="px-3 py-1 text-xs font-black uppercase">
              PAID & COMPLETED
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
            <div>
              <span className="text-muted-foreground">Payment Method:</span>
              <p className="font-extrabold uppercase text-foreground">
                {completedOrder.payment?.method || completedOrder.paymentMethod || 'CASH'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Total Amount:</span>
              <p className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                ₹{Number(completedOrder.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadPdf}
            className="w-full font-bold gap-2 text-xs h-11 border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10"
          >
            <Download className="h-4 w-4" /> Download Invoice PDF
          </Button>

          <Button
            type="button"
            variant="brand"
            onClick={onClose}
            className="w-full font-black gap-2 text-xs h-11 shadow-sm"
          >
            Start Next Sale <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
