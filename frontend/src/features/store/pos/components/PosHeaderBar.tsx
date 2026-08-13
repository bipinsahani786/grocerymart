import { User, Maximize, Minimize, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PosHeaderBarProps {
  managerName: string;
  storeName?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PosHeaderBar({
  managerName,
  storeName,
  isFullscreen,
  onToggleFullscreen,
}: PosHeaderBarProps) {
  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 mb-3 flex items-center justify-between gap-3 bg-card/50 backdrop-blur-xs p-3 rounded-xl border border-border shadow-xs">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-black px-3 py-1 gap-1.5 shadow-2xs border-primary-500/30 text-primary-600 dark:text-primary-400">
          <User className="h-3.5 w-3.5" /> Store Manager: {managerName}
        </Badge>
        <span className="text-xs text-muted-foreground font-bold hidden sm:inline">
          Store: {storeName || 'GROCERY MART'}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullscreen}
        className="h-8 text-xs font-black flex items-center gap-1.5 hover:bg-primary-500/5 hover:text-primary-600 hover:border-primary-500/30 transition-all"
        title={isFullscreen ? 'Exit Fullscreen Kiosk Mode' : 'Enter Fullscreen Kiosk Mode'}
      >
        <Tv className="h-3.5 w-3.5 text-primary-500 animate-pulse" />
        <span className="hidden xs:inline">
          {isFullscreen ? 'Exit Kiosk Mode' : 'TV Kiosk Mode'}
        </span>
        {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
