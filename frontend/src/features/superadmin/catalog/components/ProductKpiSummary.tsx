import { useMemo } from 'react';
import { Package, CheckCircle2, FolderTree, IndianRupee } from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import type { MasterProduct, MasterCategory } from '../schemas/catalogSchemas';

interface ProductKpiSummaryProps {
  products: MasterProduct[];
  categories: MasterCategory[];
}

export function ProductKpiSummary({ products, categories }: ProductKpiSummaryProps) {
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive !== false).length;
    const categoriesCount = categories.length;
    const totalPrice = products.reduce((sum, p) => sum + (p.basePrice || 0), 0);
    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;
    return { total, active, categoriesCount, avgPrice };
  }, [products, categories]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <CustomKpiCard
        title="Total Master Products"
        value={stats.total}
        subtitle="Global catalog inventory"
        icon={<Package className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Active Catalog Items"
        value={stats.active}
        subtitle="Ready for store import"
        icon={<CheckCircle2 className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Taxonomy Categories"
        value={stats.categoriesCount}
        subtitle="Assigned product groups"
        icon={<FolderTree className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Avg Base Price"
        value={`₹${stats.avgPrice}`}
        subtitle="Across master catalog"
        icon={<IndianRupee className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
    </div>
  );
}

export default ProductKpiSummary;
