
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PosHeaderBarProps {
  managerName: string;
  storeName?: string;
}

export function PosHeaderBar({ managerName, storeName }: PosHeaderBarProps) {
  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-black px-3 py-1 gap-1.5 shadow-2xs border-primary-500/30 text-primary-600 dark:text-primary-400">
          <User className="h-3.5 w-3.5" /> Store Manager: {managerName}
        </Badge>
        <span className="text-xs text-muted-foreground font-bold hidden sm:inline">
          Store: {storeName || 'GROCERY MART'}
        </span>
      </div>
    </div>
  );
}
