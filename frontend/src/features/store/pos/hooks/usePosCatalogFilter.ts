import { useState, useMemo } from 'react';

/**
 * Single Responsibility: Manages product mapping, search filtering, and recursive category tree filtering.
 */
export const usePosCatalogFilter = (inventory: any[] = [], categories: any[] = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Map products directly from products table API response
  const products = useMemo(() => {
    return inventory.map((prod: any) => {
      // Stock quantity from StoreInventory
      const availableQty = Array.isArray(prod.inventory) && prod.inventory.length > 0
        ? prod.inventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0)
        : (prod.quantity ?? 0);

      // Tax rate from product or tax class
      const taxRate = prod.taxRate ||
        prod.taxClass?.rates?.[0]?.components?.reduce((sum: number, c: any) => sum + (c.rate || 0), 0) || 0;

      const taxSplit = prod.taxClass?.rates?.[0]?.components?.reduce((acc: any, c: any) => {
        acc[c.name] = c.rate;
        return acc;
      }, {}) || null;

      return {
        id: prod.id,
        name: prod.name || 'Unnamed Product',
        sku: prod.sku,
        barcode: prod.barcode,
        price: prod.basePrice ?? prod.sellingPrice ?? prod.price ?? 0,
        mrp: prod.mrp,
        unit: prod.unit || 'pcs',
        taxRate: taxRate,
        taxSplit: taxSplit,
        categoryId: prod.categoryId,
        categoryName: prod.category?.name || 'General',
        availableQty: availableQty,
        imageUrl: prod.imageUrls || prod.imageUrl || prod.images || prod.masterProduct?.imageUrls || prod.masterProduct?.imageUrl || null,
        rawProduct: prod,
      };
    });
  }, [inventory]);

  // Filter Products by Cascading Category & Search Term
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      let matchCat = true;
      if (selectedCategory && selectedCategory !== 'ALL') {
        const catIds = new Set<string>([selectedCategory]);
        const addChildren = (parentId: string) => {
          categories.forEach((c: any) => {
            if (c.parentId === parentId && !catIds.has(c.id)) {
              catIds.add(c.id);
              addChildren(c.id);
            }
          });
        };
        addChildren(selectedCategory);
        matchCat = catIds.has(p.categoryId);
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, categories, searchQuery]);

  return {
    products,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  };
};
