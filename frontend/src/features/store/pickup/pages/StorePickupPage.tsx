import React, { useState, useMemo } from 'react';
import { 
  Tv, 
  Clock, 
  ShoppingBag, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMockStore } from '@/store/mockStore';
import { toast } from 'sonner';

export default function StorePickupPage() {
  const { orders } = useMockStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Group Click & Collect orders
  const preparingOrders = useMemo(() => {
    return orders.filter(o => 
      o.type === 'Click & Collect' && 
      ['ACCEPTED', 'PACKED'].includes(o.status)
    );
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter(o => 
      o.type === 'Click & Collect' && 
      o.status === 'READY'
    );
  }, [orders]);

  const handleAnnounceToken = (tokenId: string, name: string) => {
    if (soundEnabled) {
      // Mock announcements using browser speech synthesis (super high tech premium feature!)
      try {
        const text = `Token number ${tokenId.replace('ORD-', '')}, customer ${name}, your order is ready for pickup. Please collect it at counter.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
        toast.info(`Announcing Token #${tokenId.replace('ORD-', '')} over store speakers...`);
      } catch (e) {
        console.error('Speech synthesis not supported', e);
        toast.info(`Speaker Alert: Token #${tokenId.replace('ORD-', '')} is Ready!`);
      }
    } else {
      toast.info(`Speaker Alert: Token #${tokenId.replace('ORD-', '')} is Ready!`);
    }
  };

  // TV Monospace Board Layout
  const boardContent = (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden p-6 space-y-6">
      {/* Header controls inside TV board */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Tv className="h-6 w-6 text-primary-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-black tracking-wider uppercase font-display">Click & Collect Dispatch Board</h2>
            <p className="text-xs text-slate-400">TV Display Kiosk mode for customer collection counters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase h-9 rounded-lg"
          >
            <Volume2 className={`h-4 w-4 mr-1.5 ${soundEnabled ? 'text-primary-400' : 'text-slate-400'}`} />
            {soundEnabled ? 'Sound On' : 'Muted'}
          </Button>

          <Button 
            variant="brand" 
            size="sm" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs font-black uppercase tracking-wider h-9 rounded-lg shadow-none"
          >
            {isFullscreen ? (
              <span className="flex items-center gap-1.5"><Minimize2 className="h-4 w-4" /> Close Board</span>
            ) : (
              <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" /> TV Kiosk Mode</span>
            )}
          </Button>
        </div>
      </div>

      {/* Split grid preparing vs ready */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Preparing Box */}
        <div className="flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-amber-500 animate-spin [animation-duration:8s]" />
              Preparing / Packing ({preparingOrders.length})
            </h3>
            <Badge className="bg-amber-500/10 text-amber-400 border-none font-black text-[10px]">IN PROGRESS</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <ShoppingBag className="h-10 w-10 opacity-30 mb-2" />
                No orders preparing
              </div>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.04]">
                  <div>
                    <span className="text-xl font-extrabold text-white">#{order.id.replace('ORD-', '')}</span>
                    <p className="text-xs text-slate-400 mt-1">{order.customerName}</p>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-slate-300 font-bold text-[10px]">
                    {order.items.reduce((sum, i) => sum + i.qty, 0)} items
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready Box */}
        <div className="flex flex-col bg-emerald-950/20 rounded-2xl border border-emerald-500/15 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
            <h3 className="text-sm font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              Ready for Collection ({readyOrders.length})
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[10px] animate-pulse">PICKUP COUNTER</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <CheckCircle2 className="h-10 w-10 opacity-20 mb-2" />
                No ready orders
              </div>
            ) : (
              readyOrders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between hover:bg-emerald-500/10 cursor-pointer"
                  onClick={() => handleAnnounceToken(order.id, order.customerName)}
                >
                  <div>
                    <span className="text-2xl font-black text-emerald-400">#{order.id.replace('ORD-', '')}</span>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">{order.customerName}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase h-8 py-0 flex items-center gap-1.5"
                  >
                    <Volume2 className="h-4 w-4 animate-bounce" /> Announce
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-normal font-sans">
        <AlertCircle className="h-4.5 w-4.5 text-primary-500 shrink-0" />
        <span>
          Customer orders updated to <span className="font-bold text-white">READY</span> in the Orders page instantly appear on this screen. Click <span className="font-bold text-white">Announce</span> to trigger voice alerts.
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-8 flex flex-col">
      {!isFullscreen && (
        <PageHeader
          icon={Tv}
          title="Pickup Board (TV mode)"
          subtitle="Display live Click & Collect order preparation and ready queue tokens"
        />
      )}

      {isFullscreen ? (
        // Fullscreen cover overlay style
        <div className="fixed inset-0 z-[100] bg-slate-950 p-4 lg:p-6 flex flex-col h-screen w-screen animate-in fade-in">
          {boardContent}
        </div>
      ) : (
        // Standard in-app panel layout
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col min-h-[500px]">
          {boardContent}
        </div>
      )}
    </div>
  );
}
