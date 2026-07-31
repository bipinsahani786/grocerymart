import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';

interface PosCatalogPanelProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: any[];
  filteredProducts: any[];
  columns: ColumnDef<any>[];
  isInventoryLoading: boolean;
  handleAddToCart: (product: any) => void;
  handleBarcodeSubmit: (e: React.FormEvent) => void;
}

export function PosCatalogPanel({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredProducts,
  columns,
  isInventoryLoading,
  handleAddToCart,
  handleBarcodeSubmit,
}: PosCatalogPanelProps) {
  return (
    <div className="lg:col-span-7 flex flex-col space-y-3">
      {/* Barcode Search & Cascading Category Dropdown Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <form onSubmit={handleBarcodeSubmit} className="sm:col-span-7">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Scan barcode reader or type product name..."
          />
        </form>
        <div className="sm:col-span-5">
          <CascadingCategoryDropdown
            categories={[
              { id: 'ALL', name: 'All Categories' },
              ...categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                parentId: c.parentId || null,
              })),
            ]}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            placeholder="Filter by Category"
          />
        </div>
      </div>

      {/* Product Catalog DataTable (Direct Clean Render) */}
      <div className="flex-1 border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
        <DataTable
          data={filteredProducts}
          columns={columns}
          isLoading={isInventoryLoading}
          searchable={false}
          itemsPerPage={7}
          emptyIcon={<ShoppingBag className="h-8 w-8 text-muted-foreground/40" />}
          emptyMessage="No products match your selected category or search filter."
          onRowClick={(item) => handleAddToCart(item)}
        />
      </div>
    </div>
  );
}
