import { Tag, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OfferCardProps {
  offer: any;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function OfferCard({ offer, onToggle, onDelete }: OfferCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border border-border">
      {/* Visual ribbon */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary-500 to-amber-500" />
      
      <CardContent className="p-5 pt-6 space-y-4">
        {/* Code and active toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-lg tracking-wider border border-primary-100 dark:border-primary-900/30">
              <Tag className="h-3 w-3" />
              {offer.code}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(offer.id, offer.isActive)}
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                offer.isActive 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/30 dark:border-slate-800'
              }`}
            >
              {offer.isActive ? 'ACTIVE' : 'PAUSED'}
            </button>
            
            <button 
              onClick={() => onDelete(offer.id)}
              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description & Value */}
        <div className="space-y-1.5">
          <h4 className="text-base font-black text-slate-800 dark:text-white">
            {offer.discountType === 'FLAT' ? `₹${offer.discountValue}` : `${offer.discountValue}%`} OFF
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {offer.description || `Get ${offer.discountType === 'FLAT' ? `₹${offer.discountValue}` : `${offer.discountValue}%`} discount on your cart value.`}
          </p>
        </div>

        {/* Conditions & parameters footer */}
        <div className="border-t border-border pt-3.5 grid grid-cols-2 gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
          <div className="space-y-1">
            <span>Min Cart Value</span>
            <span className="block text-xs font-black text-slate-800 dark:text-white mt-0.5">₹{offer.minOrderValue}</span>
          </div>
          <div className="space-y-1">
            <span>Expiry Date</span>
            <span className="block text-xs font-black text-slate-800 dark:text-white mt-0.5">
              {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'NEVER'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
