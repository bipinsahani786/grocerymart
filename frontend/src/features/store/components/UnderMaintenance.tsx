import React from 'react';
import { Construction, Wrench, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UnderMaintenanceProps {
  title: string;
  description: string;
  etaHours?: number;
  backUrl?: string;
  backLabel?: string;
}

export function UnderMaintenance({
  title,
  description,
  etaHours = 4,
  backUrl = '/store/dashboard',
  backLabel = 'Back to Dashboard'
}: UnderMaintenanceProps) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-background px-4 py-12 select-none animate-page-enter">
      <Card className="w-full max-w-lg border-primary-500/25 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-amber-500 to-rose-500" />
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icon Container */}
          <div className="relative h-20 w-20 mx-auto bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center">
            <Construction className="h-10 w-10 animate-bounce" />
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <ShieldAlert className="h-3 w-3" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <Badge variant="warning" className="font-black text-[9px] uppercase tracking-widest px-3 py-1">
              Module Offline
            </Badge>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display pt-1">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          </div>

          {/* Progress / Details info */}
          <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3.5 text-xs text-left max-w-md mx-auto">
            <div className="flex justify-between items-center font-bold text-muted-foreground">
              <span>Upgrade Phase</span>
              <span className="text-primary-500">v2.1 API Sync</span>
            </div>
            
            {/* Mock progress bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-[pulse_1.5s_infinite]" style={{ width: '70%' }} />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Refactoring controllers
              </span>
              <span>ETA: {etaHours} hours</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
            <Link to={backUrl} className="flex-1">
              <Button variant="brand" className="w-full h-11 text-xs uppercase flex items-center justify-center gap-1.5 shadow-none">
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="flex-1 h-11 text-xs uppercase" 
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
