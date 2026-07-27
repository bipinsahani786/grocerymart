import { useState, useMemo } from 'react';
import { Edit, Trash2, PackageSearch, Package } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';

import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterProduct } from '../schemas/catalogSchemas';
import { AddProductForm } from '../components/AddProductForm';

import { ProductKpiSummary } from '../components/ProductKpiSummary';
import { ProductControlBar } from '../components/ProductControlBar';
import { ProductGridCard } from '../components/ProductGridCard';

export function MasterCatalogPage() {
  const { products, flatCategories, isLoadingProducts } = useMasterCatalog();

  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MasterProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<MasterProduct | null>(null);

  // Filters & View State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search Match
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      // Category Match
      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;

      // Type Match
      const matchesType = selectedType === 'all' || p.productType === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [products, search, selectedCategory, selectedType]);

  // Handle Edit Action
  const handleEditProduct = (product: MasterProduct) => {
    setEditingProduct(product);
    setIsAdding(true);
  };

  // Delete Action Handler (Placeholder for mutation when added)
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    toast.success(`Product "${productToDelete.name}" deleted successfully.`);
    setProductToDelete(null);
  };

  // Add / Edit Product View
  if (isAdding) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4 space-y-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <PageHeader
            icon={Package}
            title={editingProduct ? `Edit Master Product: ${editingProduct.name}` : "Add Master Product"}
            subtitle="Configure global product metadata available for stores to import."
          />
          <AddProductForm
            onSuccess={() => {
              setIsAdding(false);
              setEditingProduct(null);
            }}
            onCancel={() => {
              setIsAdding(false);
              setEditingProduct(null);
            }}
          />
        </div>
      </div>
    );
  }

  // DataTable Columns Definition
  const columns: ColumnDef<MasterProduct>[] = [
    {
      header: 'Product Details',
      cell: (product) => {
        const imageUrl = product.imageUrls?.[0] || '';
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <SafeCategoryImage src={imageUrl} alt={product.name} className="w-full h-full object-cover" iconSize="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight block">
                {product.name}
              </span>
              <div className="flex items-center gap-2">
                {product.brand && (
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                    {product.brand}
                  </span>
                )}
                {product.sku && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Category',
      cell: (product) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {product.category?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Type',
      cell: (product) => (
        <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50">
          {product.productType}
        </Badge>
      ),
    },
    {
      header: 'Base Price',
      cell: (product) => (
        <div className="py-1">
          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
            ₹{product.basePrice}
          </div>
          {product.mrp && product.mrp > product.basePrice && (
            <div className="text-[11px] text-slate-400 line-through">
              ₹{product.mrp}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (product) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-bold px-2 py-0.5 border ${
            product.isActive !== false
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700'
          }`}
        >
          {product.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (product) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-zinc-800 cursor-pointer"
            title="Edit Product"
            onClick={() => handleEditProduct(product)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-zinc-800 cursor-pointer"
            title="Delete Product"
            onClick={() => setProductToDelete(product)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── KPI Summary Cards ── */}
        <ProductKpiSummary products={products} categories={flatCategories} />

        {/* ── Control Bar (Search, Category/Type Filters, View Mode & Add Button) ── */}
        <ProductControlBar
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddProduct={() => {
            setEditingProduct(null);
            setIsAdding(true);
          }}
          flatCategories={flatCategories}
        />

        {/* ── Main Content Area (Table View or Grid View) ── */}
        {isLoadingProducts ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-4">
            <TableSkeleton cols={6} rows={8} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm mb-3">
              <PackageSearch className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No master products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              {search || selectedCategory || selectedType !== 'all'
                ? "No products match your current filter parameters. Try adjusting your search keywords."
                : "No master products have been created in the catalog yet."}
            </p>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsAdding(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white gap-2 cursor-pointer shadow-sm"
            >
              Add First Product
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredProducts}
              itemsPerPage={10}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={(p) => setProductToDelete(p)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Delete Confirm Modal ── */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Master Product"
        description="Are you sure you want to delete this master product? Stores that imported this product will keep their local copy."
        itemName={productToDelete?.name}
      />
    </div>
  );
}

export default MasterCatalogPage;
