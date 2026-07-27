import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useMasterCatalog } from '../api/useMasterCatalog';
import { AddProductForm } from '../components/AddProductForm';

export function MasterCatalogPage() {
  const { products, isLoadingProducts } = useMasterCatalog();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  if (isAdding) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Add Master Product"
          subtitle="Add a new product to the global master catalog."
        />
        <div className="px-6 pb-6">
          <AddProductForm 
            onSuccess={() => setIsAdding(false)} 
            onCancel={() => setIsAdding(false)} 
          />
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Master Catalog"
        subtitle="Manage global products available for stores to import."
        actions={
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        }
      />

      <div className="px-6 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search master products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="px-6 pb-6 flex-1">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Base Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading products...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No master products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                            {product.imageUrls?.[0] && (
                              <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                            {product.brand && <div className="text-xs text-slate-500">{product.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {product.category?.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full capitalize">
                          {product.productType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                        ₹{product.basePrice}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
                          product.isActive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-primary-600">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterCatalogPage;
