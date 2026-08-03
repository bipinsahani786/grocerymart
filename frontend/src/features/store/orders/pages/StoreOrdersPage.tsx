import { useState, useMemo } from "react";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/store/authStore";
import {
  useStoreOrders,
  useUpdateStoreOrderStatus,
} from "@/features/store/api/useStorePanel";
import { toast } from "sonner";
import { OrderFilters } from "../components/OrderFilters";
import type { OrderTypeFilter, OrderStatusFilter } from "../components/OrderFilters";
import { OrderList } from "../components/OrderList";
import { OrderDetail } from "../components/OrderDetail";

export default function StoreOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("All");

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
  };

  const mappedType = typeFilter === "Click & Collect" ? "CLICK_COLLECT" : typeFilter;

  const { data: ordersData } = useStoreOrders(storeId, {
    page,
    limit,
    search: searchQuery,
    type: mappedType,
    status: statusFilter,
  });

  const updateStatusMutation = useUpdateStoreOrderStatus();

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // 1. Find currently selected order
  const selectedOrder = useMemo(() => {
    return orders.find((o: any) => o.id === selectedOrderId) || orders[0] || null;
  }, [orders, selectedOrderId]);

  // Handle filter changes (resets page to 1)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleTypeChange = (val: OrderTypeFilter) => {
    setTypeFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: OrderStatusFilter) => {
    setStatusFilter(val);
    setPage(1);
  };

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
          toast.error(
            err.response?.data?.message || "Failed to update order status"
          );
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

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-8">
      <PageHeader
        icon={ClipboardCheck}
        title="Live Orders Queue"
        subtitle="Manage and fulfill POS, Delivery, and Click & Collect orders"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <OrderFilters
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          typeFilter={typeFilter}
          setTypeFilter={handleTypeChange}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusChange}
        />

        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">
          <OrderList
            orders={orders}
            selectedOrderId={selectedOrderId || (selectedOrder?.id || "")}
            setSelectedOrderId={setSelectedOrderId}
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
          />
          <OrderDetail
            selectedOrder={selectedOrder}
            handleUpdateStatus={handleUpdateStatus}
            handleCancelOrder={handleCancelOrder}
          />
        </div>
      </div>
    </div>
  );
}
