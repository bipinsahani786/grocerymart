import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Search,
  ShoppingCart,
  Truck,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  
  Package,
  MapPin,
  Smartphone,
  Tag,
  Ban,
  
  Zap,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { useAuthStore } from "@/store/authStore";
import { useStoreOrders, useUpdateStoreOrderStatus } from "@/features/store/api/useStorePanel";
import { toast } from "sonner";

export default function StoreOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: ordersData } = useStoreOrders(storeId);
  const updateStatusMutation = useUpdateStoreOrderStatus();

  const orders = ordersData || [];

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "All" | "POS" | "Delivery" | "Click & Collect"
  >("All");
  const [statusFilter, setStatusFilter] = useState<
    | "All"
    | "ACTIVE"
    | "PLACED"
    | "ACCEPTED"
    | "PACKED"
    | "READY"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
  >("All");
  const [enteredPin, setEnteredPin] = useState("");

  // 1. Find currently selected order
  const selectedOrder = useMemo(() => {
    return orders.find((o: any) => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // 2. Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      // Type Filter
      if (typeFilter !== "All") {
        if (typeFilter === "Click & Collect" && order.type !== "CLICK_COLLECT") return false;
        if (typeFilter === "Delivery" && order.type !== "DELIVERY") return false;
        if (typeFilter === "POS" && order.type !== "POS") return false;
      }

      // Status Filter
      if (statusFilter !== "All") {
        if (statusFilter === "ACTIVE") {
          if (["DELIVERED", "CANCELLED", "REFUNDED", "COLLECTED", "COMPLETED"].includes(order.status)) {
            return false;
          }
        } else if (order.status !== statusFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const numMatch = (order.orderNumber || order.id).toLowerCase().includes(q);
        const nameMatch = (order.customer?.name || order.customerName || "").toLowerCase().includes(q);
        const phoneMatch = (order.customer?.phone || order.customerPhone || "").includes(q);
        return numMatch || nameMatch || phoneMatch;
      }

      return true;
    });
  }, [orders, typeFilter, statusFilter, searchQuery]);

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = "ACCEPTED";
    if (currentStatus === "PLACED") nextStatus = "ACCEPTED";
    else if (currentStatus === "ACCEPTED") nextStatus = "PACKING";
    else if (currentStatus === "PACKING") nextStatus = "PACKED";
    else if (currentStatus === "PACKED") nextStatus = "READY_FOR_PICKUP";
    else if (currentStatus === "READY_FOR_PICKUP") nextStatus = "DELIVERED";

    updateStatusMutation.mutate(
      { orderId: id, status: nextStatus, storeId },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${nextStatus}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update order status');
        },
      }
    );
  };

  const handleCancelOrder = (id: string) => {
    updateStatusMutation.mutate(
      { orderId: id, status: "CANCELLED", storeId },
      {
        onSuccess: () => {
          toast.warning(`Order ${id} Cancelled`);
        },
      }
    );
  };

  const getStatusBadgeVariant = (status: string) => {
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
  };

  const getTypeIcon = (type: string) => {
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
  };

  // Find rack location of products in selected order
  const orderItemsWithRack = useMemo(() => {
    if (!selectedOrder) return [];
    return (selectedOrder.items || []).map((item: any) => {
      return {
        ...item,
        rackLocation: item.rackLocation || item.product?.rackLocation || "Aisle Main",
      };
    });
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-8">
      <PageHeader
        icon={ClipboardCheck}
        title="Live Orders Queue"
        subtitle="Manage and fulfill POS, Delivery, and Click & Collect orders"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Simulator Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
              Interactive Order Simulation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click to generate a new live customer order to test the pipeline
            </p>
          </div>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => toast.info('New customer orders appear live in real-time as customers order.')}
            className="shrink-0 flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Simulate Customer Order
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by ID, Customer Name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Type Filters */}
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              {(["All", "POS", "Delivery", "Click & Collect"] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${typeFilter === type
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {type === "All" ? "All Channels" : type}
                  </button>
                ),
              )}
            </div>

            {/* Status Filters */}
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              {(
                ["All", "ACTIVE", "PLACED", "PACKED", "DELIVERED"] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${statusFilter === status
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {status === "All"
                    ? "All Status"
                    : status === "ACTIVE"
                      ? "Active"
                      : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">
          {/* Left Column: Orders List */}
          <Card className="min-h-[500px]">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-wider">
                Matching Orders ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredOrders.length === 0 ? (
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
                  {filteredOrders.map((order: any) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${selectedOrderId === order.id
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
                          {order.customer?.name || order.customerName || 'Customer'}
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
                              (sum: number, item: any) => sum + (item.quantity || item.qty || 1),
                              0,
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
          </Card>

          {/* Right Column: Order Detail View */}
          <Card className="shadow-lg border-primary-500/20">
            {selectedOrder ? (
              <>
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
                        {selectedOrder.customer?.name || selectedOrder.customerName || 'Walk-in Customer'}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />{" "}
                        {selectedOrder.customer?.phone || selectedOrder.customerPhone || 'N/A'}
                      </p>
                      {selectedOrder.type === "Delivery" &&
                        selectedOrder.distanceKm && (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Delivery distance:{" "}
                            {selectedOrder.distanceKm} km
                          </p>
                        )}
                      {selectedOrder.type === "Click & Collect" &&
                        selectedOrder.pickupPin && (
                          <p className="text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" /> Collection Token
                            PIN: {selectedOrder.pickupPin}
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
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                Qty: {item.qty}
                              </span>
                              <span className="text-slate-300">•</span>
                              <Badge className="bg-primary-500/10 text-primary-600 dark:text-primary-400 border-none font-bold text-[9px] uppercase">
                                {item.rackLocation}
                              </Badge>
                            </div>
                          </div>
                          <span className="font-extrabold shrink-0 text-slate-950 dark:text-white">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t border-border pt-4 text-xs space-y-2">
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Discount Applied:</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>GST Component:</span>
                      <span>₹{selectedOrder.taxAmount}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
                      <span>Grand Total:</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Payment: {selectedOrder.paymentMethod}</span>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold uppercase py-0"
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions Pipeline */}
                  <div className="border-t border-border pt-4 space-y-3">
                    {/* Progression flow button */}
                    {["PLACED", "ACCEPTED", "PACKED", "READY"].includes(
                      selectedOrder.status,
                    ) && (
                        <div className="space-y-3">
                          {selectedOrder.status === "READY" &&
                            selectedOrder.type === "Click & Collect" && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Enter Customer Collection PIN (Mock:{" "}
                                  {selectedOrder.pin})
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
                              handleUpdateStatus(
                                selectedOrder.id,
                                selectedOrder.status,
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                            {selectedOrder.status === "PLACED" && "Accept Order"}
                            {selectedOrder.status === "ACCEPTED" &&
                              "Start Packing (Mark Packed)"}
                            {selectedOrder.status === "PACKED" &&
                              (selectedOrder.type === "Delivery"
                                ? "Ship Order (Out for Delivery)"
                                : "Mark Ready for Handover")}
                            {selectedOrder.status === "READY" &&
                              (selectedOrder.type === "Click & Collect"
                                ? "Verify PIN & Handover"
                                : "Complete Delivery")}
                          </Button>
                        </div>
                      )}

                    {/* Final state completed visual */}
                    {selectedOrder.status === "DELIVERED" && (
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
                        <CheckCircle className="h-4.5 w-4.5" /> Order Completed
                        & Handed Over
                      </div>
                    )}

                    {selectedOrder.status === "CANCELLED" && (
                      <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
                        <Ban className="h-4.5 w-4.5" /> Order Cancelled
                      </div>
                    )}

                    {selectedOrder.status === "REFUNDED" && (
                      <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl flex items-center gap-2.5 justify-center font-bold text-xs">
                        <AlertTriangle className="h-4.5 w-4.5" /> Order Voided &
                        Refunded
                      </div>
                    )}

                    {/* Cancellation backup button */}
                    {["PLACED", "ACCEPTED"].includes(selectedOrder.status) && (
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
              </>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                Select an order from the list to view its detail
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
