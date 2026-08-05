import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Tv, 
  Clock, 
  ShoppingBag, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  CheckCircle2,
  AlertCircle,
  Package,
  VolumeX
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useStorePickupQueue } from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';

export default function StorePickupPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: pickupData } = useStorePickupQueue(storeId);
  const orders = pickupData || [];

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Group Click & Collect orders
  const preparingOrders = useMemo(() => {
    return orders.filter((o: any) => 
      o.type === 'CLICK_COLLECT' && 
      ['PLACED', 'ACCEPTED', 'PACKING', 'PACKED'].includes(o.status)
    );
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter((o: any) => 
      o.type === 'CLICK_COLLECT' && 
      o.status === 'READY_FOR_PICKUP'
    );
  }, [orders]);

  const handleAnnounceToken = (tokenId: string, name: string) => {
    if (soundEnabled) {
      try {
        const text = `Token number ${tokenId.replace('ORD-', '')}, customer ${name}, your order is ready for pickup. Please collect it at counter.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
        toast.info(`Announcing Token #${tokenId.replace('ORD-', '')} over speakers...`);
      } catch (e) {
        console.error('Speech synthesis not supported', e);
        toast.info(`Speaker Alert: Token #${tokenId.replace('ORD-', '')} is Ready!`);
      }
    } else {
      toast.info(`Speaker Alert: Token #${tokenId.replace('ORD-', '')} is Ready!`);
    }
  };

  const boardContent = (
    <div className={`flex-grow flex flex-col space-y-6 overflow-hidden ${isFullscreen ? 'bg-background p-6 rounded-2xl border border-border shadow-xl h-full' : ''}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Click & Collect Dispatch Board
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time customer collection board & speaker announcer
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs font-bold uppercase h-9 rounded-lg"
          >
            {soundEnabled ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Volume2 className="h-4 w-4" /> Sound Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-500">
                <VolumeX className="h-4 w-4" /> Sound Muted
              </span>
            )}
          </Button>

          <Button 
            variant="brand" 
            size="sm" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs font-black uppercase tracking-wider h-9 rounded-lg shadow-none"
          >
            {isFullscreen ? (
              <span className="flex items-center gap-1.5"><Minimize2 className="h-4 w-4" /> Exit Kiosk Mode</span>
            ) : (
              <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" /> TV Kiosk Mode</span>
            )}
          </Button>
        </div>
      </div>

      {/* Grid of Queues */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {/* Preparing Column */}
        <Card className="flex flex-col border border-border bg-card shadow-xs rounded-2xl overflow-hidden h-full">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-border py-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 animate-spin [animation-duration:12s]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    Preparing
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Orders currently packaging
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-amber-500/5 border-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] px-2 py-0.5 animate-pulse">
                {preparingOrders.length} IN QUEUE
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-thin">
            {preparingOrders.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground text-xs py-12">
                <ShoppingBag className="h-12 w-12 opacity-25 mb-3" />
                <p className="font-semibold">All orders packed</p>
                <p className="text-[10px] opacity-75 mt-0.5">No orders in preparation queue.</p>
              </div>
            ) : (
              preparingOrders.map((order: any) => (
                <div key={order.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-border rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        #{order.orderNumber || order.id.replace('ORD-', '')}
                      </span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold uppercase px-1.5 py-0.2 rounded">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {order.customerName || order.customer?.name || 'Walk-in Customer'}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-border text-slate-600 dark:text-slate-400 font-bold text-[10px] bg-card">
                    {(order.items || []).reduce((sum: number, i: any) => sum + (i.quantity || i.qty || 1), 0)} items
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Ready Column */}
        <Card className="flex flex-col border border-emerald-500/20 bg-card shadow-xs rounded-2xl overflow-hidden h-full">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-emerald-500/20 py-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    Ready for Collection
                  </CardTitle>
                  <CardDescription className="text-[10px] text-emerald-650 dark:text-emerald-400">
                    Awaiting customer counter pickup
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] px-2 py-0.5 animate-pulse">
                {readyOrders.length} WAITING
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-thin">
            {readyOrders.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground text-xs py-12">
                <Package className="h-12 w-12 opacity-25 mb-3 text-emerald-500" />
                <p className="font-semibold">Queue empty</p>
                <p className="text-[10px] opacity-75 mt-0.5">No ready orders waiting collection.</p>
              </div>
            ) : (
              readyOrders.map((order: any) => (
                <div 
                  key={order.id} 
                  className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/10 rounded-xl flex items-center justify-between hover:bg-emerald-50/40 dark:hover:bg-emerald-950/15 transition-colors cursor-pointer"
                  onClick={() => handleAnnounceToken(order.orderNumber || order.id, order.customerName || order.customer?.name || 'Customer')}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        #{order.orderNumber || order.id.replace('ORD-', '')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                      {order.customerName || order.customer?.name || 'Customer'}
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase h-8.5 px-3 py-0 flex items-center gap-1.5 rounded-lg shadow-2xs"
                  >
                    <Volume2 className="h-4 w-4 animate-bounce" /> Announce
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info notice bar */}
      <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/55 p-3 rounded-xl border border-border text-[11px] text-muted-foreground leading-relaxed font-sans shrink-0">
        <AlertCircle className="h-4.5 w-4.5 text-primary-500 shrink-0 mt-0.5" />
        <span>
          Customer orders updated to <span className="font-bold text-foreground">READY FOR PICKUP</span> in the Orders page instantly appear on this screen. Click the <span className="font-bold text-foreground">Announce</span> button to trigger store speaker voice announcement alerts.
        </span>
      </div>
    </div>
  );

  const content = isFullscreen ? (
    createPortal(
      <div className="fixed inset-0 z-[9999] bg-background p-4 lg:p-6 flex flex-col h-screen w-screen animate-in fade-in overflow-hidden dark:bg-slate-950 dark:text-white">
        {boardContent}
      </div>,
      document.body
    )
  ) : (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 flex-grow flex flex-col min-h-[500px]">
      {boardContent}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-8 flex flex-col">
      {!isFullscreen && (
        <PageHeader
          icon={Tv}
          title="Pickup Board & Speaker"
          subtitle="Display live Click & Collect order preparation queue and trigger speaker announcements"
        />
      )}

      {content}
    </div>
  );
}
