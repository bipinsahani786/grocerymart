import { Layers, FolderTree, FolderPlus, Sparkles } from 'lucide-react';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';

interface CategoryKpiSummaryProps {
  stats: {
    total: number;
    rootCount: number;
    subCount: number;
  };
}

export function CategoryKpiSummary({ stats }: CategoryKpiSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <CustomKpiCard
        title="Total Categories"
        value={stats.total}
        subtitle={`${stats.rootCount} Root • ${stats.subCount} Subcategories`}
        icon={<Layers className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Root Categories"
        value={stats.rootCount}
        subtitle="Top Level Main Taxonomies"
        icon={<FolderTree className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Subcategories"
        value={stats.subCount}
        subtitle="Nested Catalog Branches"
        icon={<FolderPlus className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
      <CustomKpiCard
        title="Catalog Coverage"
        value="100%"
        subtitle="Global Master Taxonomy"
        icon={<Sparkles className="w-5 h-5" />}
        colorClass="bg-primary-500"
      />
    </div>
  );
}

export default CategoryKpiSummary;
