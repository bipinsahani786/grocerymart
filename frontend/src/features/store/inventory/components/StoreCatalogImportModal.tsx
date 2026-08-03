import { useState, useMemo } from 'react';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useStoreMasterCatalog, useImportMasterProducts } from '../../api/useStorePanel';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface StoreCatalogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
}

export function StoreCatalogImportModal({ isOpen, onClose, storeId }: StoreCatalogImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const { data: masterProducts, isLoading } = useStoreMasterCatalog(storeId);
  const importMutation = useImportMasterProducts();

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!masterProducts) return ['All'];
    const cats = new Set(masterProducts.map((p: any) => p.category?.name).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [masterProducts]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    if (!masterProducts) return [];
    return masterProducts.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || p.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [masterProducts, searchQuery, selectedCategory]);

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0) {
      // Deselect all
      setSelectedProductIds(new Set());
    } else {
      // Select all filtered
      const allFilteredIds = filteredProducts.map((p: any) => p.id);
      setSelectedProductIds(new Set(allFilteredIds));
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const handleImport = () => {
    if (selectedProductIds.size === 0) {
      toast.error('Please select at least one product to import.');
      return;
    }

    const productIds = Array.from(selectedProductIds);
    importMutation.mutate(
      { storeId, productIds },
      {
        onSuccess: (data) => {
          toast.success(data.message || `Successfully imported ${productIds.length} products!`);
          onClose();
          setSelectedProductIds(new Set());
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to import products');
        }
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Products from Master Catalog"
      maxWidth="4xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {selectedProductIds.size} product(s) selected
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={importMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={handleImport}
              isLoading={importMutation.isPending}
              disabled={selectedProductIds.size === 0}
            >
              Import Selected ({selectedProductIds.size})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search master catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="w-full sm:w-48 z-10">
            <CustomDropdown
              options={categories.map((cat: any) => ({ value: cat, label: cat }))}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(String(val))}
              placeholder="Select Category"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0A0A0A]">
          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Loading master catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No products found matching your search.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b border-slate-200 dark:border-white/10 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 dark:border-white/20 text-brand-500 focus:ring-brand-500"
                      />
                    </th>
                    <th className="p-3 border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="p-3 border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="p-3 border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Price (MRP)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredProducts.map((p: any) => {
                    const isSelected = selectedProductIds.has(p.id);
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${isSelected ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}
                        onClick={() => toggleProduct(p.id)}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(p.id)}
                            className="rounded border-slate-300 dark:border-white/20 text-brand-500 focus:ring-brand-500"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {p.imageUrls?.[0] ? (
                                <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</div>
                              {(p.barcode || p.sku) && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {p.barcode || p.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                          {p.category?.name || '-'}
                        </td>
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-white text-right">
                          ₹{p.mrp || p.basePrice || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
