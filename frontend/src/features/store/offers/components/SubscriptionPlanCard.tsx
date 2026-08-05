import { Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SubscriptionPlanCardProps {
  sub: any;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionPlanCard({ sub, onToggle, onDelete }: SubscriptionPlanCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border border-border">
      {/* Visual VIP indicator */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary-500 to-amber-500" />
      
      <CardContent className="p-5 pt-6 space-y-4">
        {/* Name & Toggle status */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary-500" />
              {sub.name}
            </h4>
            <span className="text-[10px] text-muted-foreground tracking-widest font-black uppercase">
              {sub.durationDays} Days Duration Plan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(sub.id, sub.isActive)}
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                sub.isActive 
                  ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900/30' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/30 dark:border-slate-800'
              }`}
            >
              {sub.isActive ? 'ACTIVE' : 'PAUSED'}
            </button>
            
            <button 
              onClick={() => onDelete(sub.id)}
              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Price indicator */}
        <div className="py-2.5 border-y border-border flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary-500">₹{sub.price}</span>
          <span className="text-[10px] text-muted-foreground font-bold">/ PLAN PRICE</span>
        </div>

        {/* Benefits checklist */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Included VIP Benefits</span>
          {sub.features && sub.features.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {sub.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 leading-normal">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">No customized benefit points added.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
