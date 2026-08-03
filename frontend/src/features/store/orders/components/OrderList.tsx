import { ShoppingCart, Truck, ShoppingBag, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PLACED":
      return "warning";
    case "ACCEPTED":
    case "PACKING":
      return "outline";
    case "PACKED":
      return "default";
    case "READY_FOR_PICKUP":
      return "info";
    case "DELIVERED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REFUNDED":
      return "destructive";
    default:
      return "outline";
  }
}

export function getTypeIcon(type: string) {
  switch (type) {
    case "POS":
      return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
    case "DELIVERY":
    case "Delivery":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "CLICK_COLLECT":
    case "Click & Collect":
      return <ShoppingBag className="h-4 w-4 text-amber-500" />;
    default:
      return <ShoppingCart className="h-4 w-4 text-slate-500" />;
  }
}

interface OrderListProps {
  orders: any[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function OrderList({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  pagination,
  onPageChange,
  onLimitChange,
}: OrderListProps) {
  return (
    <Card className="min-h-[500px] flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-wider">
            Matching Orders {pagination ? `(${pagination.total})` : `(${orders.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">
                No orders found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your filters or query
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedOrderId === order.id
                      ? "bg-primary-500/5 border-l-4 border-primary-500"
                      : "hover:bg-muted/30 border-l-4 border-transparent"
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {order.orderNumber || order.id}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        {getTypeIcon(order.type)}
                        {order.type}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {order.customer?.name || order.customerName || "Customer"}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <span>
                        •{" "}
                        {(order.items || []).reduce(
                          (sum: number, item: any) =>
                            sum + (item.quantity || item.qty || 1),
                          0
                        )}{" "}
                        items
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="font-black text-sm">
                      ₹{order.totalAmount}
                    </span>
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="text-[9px] font-black uppercase px-2 py-0.5"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      {pagination && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-muted/10">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            {onLimitChange && (
              <div className="flex items-center gap-1.5 min-w-[110px]">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Show:</span>
                <CustomDropdown
                  value={pagination.limit}
                  onChange={(val) => onLimitChange(Number(val))}
                  options={[
                    { value: 5, label: "5 rows" },
                    { value: 10, label: "10 rows" },
                    { value: 20, label: "20 rows" },
                    { value: 50, label: "50 rows" },
                    { value: 100, label: "100 rows" },
                  ]}
                  className="w-24"
                  triggerClassName="h-8 py-0 px-2"
                />
              </div>
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-xs font-bold rounded bg-background border border-border hover:bg-muted disabled:opacity-50 transition-all cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-xs font-bold rounded bg-background border border-border hover:bg-muted disabled:opacity-50 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
