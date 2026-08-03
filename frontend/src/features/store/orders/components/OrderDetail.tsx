import { useMemo, useState } from "react";
import {
  Smartphone,
  MapPin,
  Tag,
  CheckCircle,
  AlertTriangle,
  Ban,
  ClipboardCheck,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { getFileUrl } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStatusBadgeVariant, getTypeIcon } from "./OrderList";

interface OrderDetailProps {
  selectedOrder: any | null;
  handleUpdateStatus: (id: string, currentStatus: string) => void;
  handleCancelOrder: (id: string) => void;
}

export function OrderDetail({
  selectedOrder,
  handleUpdateStatus,
  handleCancelOrder,
}: OrderDetailProps) {
  const [enteredPin, setEnteredPin] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const orderItemsWithRack = useMemo(() => {
    if (!selectedOrder) return [];
    return (selectedOrder.items || []).map((item: any) => {
      return {
        ...item,
        rackLocation:
          item.rackLocation || item.product?.rackLocation || "Aisle Main",
      };
    });
  }, [selectedOrder]);

  const handleDownloadInvoicePdf = () => {
    if (!selectedOrder) return;
    const pdfUrl = selectedOrder.invoicePdfUrl;
    const orderId = selectedOrder.id;
    const token = useAuthStore.getState().token;

    const targetUrl = pdfUrl
      ? getFileUrl(pdfUrl)
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/store/orders/${orderId}/pdf`;

    setIsDownloadingPdf(true);
    fetch(targetUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((pdfRes) => {
        if (!pdfRes.ok) throw new Error('PDF download failed');
        return pdfRes.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      })
      .catch((err) => {
        console.error('Invoice PDF fetch failed:', err);
        if (orderId && token) {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          window.open(`${apiBase}/store/orders/${orderId}/pdf?token=${encodeURIComponent(token)}`, '_blank');
        } else {
          toast.error('Failed to download invoice PDF.');
        }
      })
      .finally(() => {
        setIsDownloadingPdf(false);
      });
  };

  if (!selectedOrder) {
    return (
      <Card className="shadow-lg border-primary-500/20">
        <div className="p-12 text-center text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
          Select an order from the list to view its detail
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary-500/20">
      <CardHeader className="pb-4 border-b border-border bg-muted/20">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                {selectedOrder.orderNumber || selectedOrder.id}
              </CardTitle>
              <Badge
                variant={getStatusBadgeVariant(selectedOrder.status)}
                className="text-[9px] uppercase font-black"
              >
                {selectedOrder.status}
              </Badge>
            </div>
            <CardDescription className="mt-1 flex items-center gap-1">
              {getTypeIcon(selectedOrder.type)}
              {selectedOrder.type} channel
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadInvoicePdf} 
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 h-8 text-xs shrink-0"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Invoice
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Customer Information Card */}
        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Customer Info
          </h4>
          <div className="text-xs space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-white">
              {selectedOrder.customer?.name ||
                selectedOrder.customerName ||
                "Walk-in Customer"}
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
              <Smartphone className="h-3 w-3" />{" "}
              {selectedOrder.customer?.phone ||
                selectedOrder.customerPhone ||
                "N/A"}
            </p>
            {selectedOrder.type === "Delivery" && selectedOrder.distanceKm && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Delivery distance:{" "}
                {selectedOrder.distanceKm} km
              </p>
            )}
            {selectedOrder.type === "Click & Collect" &&
              selectedOrder.pickupPin && (
                <p className="text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Collection Token PIN:{" "}
                  {selectedOrder.pickupPin}
                </p>
              )}
          </div>
        </div>

        {/* Items List / Picker Guide */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Items & Picker Route
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] font-bold text-primary-500 border-primary-500/20"
            >
              Sorted by Zone
            </Badge>
          </div>

          <div className="divide-y divide-border max-h-[220px] overflow-y-auto pr-1">
            {orderItemsWithRack.map((item: any) => (
              <div
                key={item.productId}
                className="py-2.5 flex justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {item.productName || item.product?.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Qty: {item.qty || item.quantity}
                    </span>
                    <span className="text-slate-300">•</span>
                    <Badge className="bg-primary-500/10 text-primary-600 dark:text-primary-400 border-none font-bold text-[9px] uppercase">
                      {item.rackLocation}
                    </Badge>
                  </div>
                </div>
                <span className="font-extrabold shrink-0 text-slate-950 dark:text-white">
                  ₹{(item.price !== undefined ? item.price : (item.product?.basePrice || 0)) * (item.qty || item.quantity || 1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-border pt-4 text-xs space-y-2">
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>Discount Applied:</span>
            <span>-₹{selectedOrder.discount || 0}</span>
          </div>
          <div className="flex justify-between text-muted-foreground font-medium">
            <span>GST Component:</span>
            <span>₹{selectedOrder.taxAmount || 0}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
            <span>Grand Total:</span>
            <span>₹{selectedOrder.totalAmount || 0}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Payment: {selectedOrder.payment?.method || selectedOrder.paymentMethod || "CASH"}</span>
            <Badge
              variant="outline"
              className="text-[8px] font-bold uppercase py-0"
            >
              {selectedOrder.payment?.status || selectedOrder.paymentStatus || "PENDING"}
            </Badge>
          </div>
        </div>

        {/* Actions Pipeline */}
        <div className="border-t border-border pt-4 space-y-3">
          {["PLACED", "ACCEPTED", "PACKING", "PACKED", "READY_FOR_PICKUP"].includes(
            selectedOrder.status
          ) && (
            <div className="space-y-3">
              {selectedOrder.status === "READY_FOR_PICKUP" &&
                selectedOrder.type === "Click & Collect" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Enter Customer Collection PIN (Mock:{" "}
                      {selectedOrder.pickupPin || "N/A"})
                    </label>
                    <Input
                      placeholder="Enter 4-digit PIN"
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      maxLength={4}
                      className="h-10"
                    />
                  </div>
                )}

              <Button
                className="w-full h-11 flex items-center justify-center gap-2"
                variant="brand"
                onClick={() =>
                  handleUpdateStatus(selectedOrder.id, selectedOrder.status)
                }
              >
                <CheckCircle className="h-4 w-4" />
                {selectedOrder.status === "PLACED" && "Accept Order"}
                {selectedOrder.status === "ACCEPTED" &&
                  "Start Packing (Mark Packing)"}
                {selectedOrder.status === "PACKING" &&
                  "Finish Packing (Mark Packed)"}
                {selectedOrder.status === "PACKED" &&
                  (selectedOrder.type === "DELIVERY" || selectedOrder.type === "Delivery"
                    ? "Ship Order (Out for Delivery)"
                    : "Mark Ready for Handover")}
                {selectedOrder.status === "READY_FOR_PICKUP" &&
                  (selectedOrder.type === "CLICK_COLLECT" || selectedOrder.type === "Click & Collect"
                    ? "Verify PIN & Handover"
                    : "Complete Delivery")}
              </Button>
            </div>
          )}

          {/* Final state completed visual */}
          {["DELIVERED", "COMPLETED"].includes(selectedOrder.status) && (
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
              <CheckCircle className="h-4.5 w-4.5" /> Order Completed & Handed
              Over
            </div>
          )}

          {selectedOrder.status === "CANCELLED" && (
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
              <Ban className="h-4.5 w-4.5" /> Order Cancelled
            </div>
          )}

          {selectedOrder.status === "REFUNDED" && (
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
              <AlertTriangle className="h-4.5 w-4.5" /> Order Voided & Refunded
            </div>
          )}

          {/* Cancellation backup button */}
          {["PLACED", "ACCEPTED", "PACKING"].includes(selectedOrder.status) && (
            <Button
              className="w-full h-10 flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10"
              variant="ghost"
              onClick={() => handleCancelOrder(selectedOrder.id)}
            >
              <Ban className="h-4 w-4" /> Cancel Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
