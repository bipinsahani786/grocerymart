import React, { useMemo } from 'react';
import { PackageSearch, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';

interface StoreInventoryKpisProps {
  products: any[];
  categories: any[];
}

/**
 * Single Responsibility: Calculates inventory metric KPIs and renders summary cards.
 */
export const StoreInventoryKpis: React.FC<StoreInventoryKpisProps> = ({ products, categories }) => {
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const outOfStock = products.filter((p: any) => (p.inventory?.[0]?.quantity || 0) <= 0).length;
    const lowStock = products.filter((p: any) => {
      const q = p.inventory?.[0]?.quantity || 0;
      return q > 0 && q <= (p.lowStockAt || 10);
    }).length;

    return { totalProducts, totalCategories, outOfStock, lowStock };
  }, [products, categories]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-page-enter">
      <CustomKpiCard
        title="Total Catalog Items"
        value={metrics.totalProducts}
        subtitle="Products configured for this store"
        icon={<PackageSearch />}
        colorClass="bg-primary-500"
        iconColorClass="bg-white/20 text-white"
      />
      <CustomKpiCard
        title="Active Categories"
        value={metrics.totalCategories}
        subtitle="Taxonomy groups in use"
        icon={<Layers />}
        colorClass="bg-primary-500"
        iconColorClass="bg-white/20 text-white"
      />
      <CustomKpiCard
        title="Low Stock Alerts"
        value={metrics.lowStock}
        subtitle="Items needing replenishment"
        icon={<AlertTriangle />}
        colorClass="bg-primary-500"
        iconColorClass="bg-white/20 text-white"
      />
      <CustomKpiCard
        title="Out of Stock"
        value={metrics.outOfStock}
        subtitle="Currently unavailable items"
        icon={<CheckCircle />}
        colorClass="bg-primary-500"
        iconColorClass="bg-white/20 text-white"
      />
    </div>
  );
};
