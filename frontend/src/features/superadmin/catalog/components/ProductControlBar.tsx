import { LayoutGrid, Table, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/SearchBar';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';
import type { MasterCategory } from '../schemas/catalogSchemas';
import React from 'react';

interface ProductControlBarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  onAddProduct: () => void;
  flatCategories: MasterCategory[];
}

export function ProductControlBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  viewMode,
  setViewMode,
  onAddProduct,
  flatCategories,
}: ProductControlBarProps) {
  const cascadingCategories = React.useMemo(() => {
    return [
      { id: '', name: 'ALL CATEGORIES', parentId: null },
      ...flatCategories
    ];
  }, [flatCategories]);

  const typeOptions = [
    { value: 'all', label: 'ALL TYPES' },
    { value: 'simple', label: 'SIMPLE' },
    { value: 'variant', label: 'VARIANT' },
    { value: 'loose', label: 'LOOSE' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search products by name, SKU..."
          />
        </div>

        <div className="w-full sm:w-52 z-20">
          <CascadingCategoryDropdown
            categories={cascadingCategories as any}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="ALL CATEGORIES"
            triggerClassName="h-8 text-xs"
          />
        </div>

        <div className="w-full sm:w-44">
          <CustomDropdown
            options={typeOptions}
            value={selectedType}
            onChange={setSelectedType}
            placeholder="ALL TYPES"
            triggerClassName="h-8 text-xs"
          />
        </div>
      </div>

      {/* Right Controls & Add Button */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'table'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            title="Table View"
          >
            <Table className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>

        <Button
          onClick={onAddProduct}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}

export default ProductControlBar;
