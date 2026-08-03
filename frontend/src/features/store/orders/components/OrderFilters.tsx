import { SearchBar } from "@/components/ui/SearchBar";

export type OrderTypeFilter = "All" | "POS" | "Delivery" | "Click & Collect";
export type OrderStatusFilter =
  | "All"
  | "ACTIVE"
  | "PLACED"
  | "ACCEPTED"
  | "PACKED"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: OrderTypeFilter;
  setTypeFilter: (val: OrderTypeFilter) => void;
  statusFilter: OrderStatusFilter;
  setStatusFilter: (val: OrderStatusFilter) => void;
}

export function OrderFilters({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
      <div className="relative flex-1 max-w-md">
        <SearchBar
          placeholder="Search by ID, Customer Name, SKU..."
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Type Filters */}
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          {(["All", "POS", "Delivery", "Click & Collect"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                typeFilter === type
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "All" ? "All Channels" : type}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          {(["All", "ACTIVE", "PLACED", "PACKED", "DELIVERED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                statusFilter === status
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
  );
}
