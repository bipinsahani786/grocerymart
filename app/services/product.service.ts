import { products as localProductData, Product } from '../data/groceryData';

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Single Responsibility: Manages product catalog querying and pagination.
 * Open/Closed: Can easily be swapped from local mock to remote API without changing UI screens.
 */
export class ProductService {
  async fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const { category = 'all', search = '' } = filters;

    // Simulate network latency (250ms)
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Perform query filtering
    return localProductData.filter((product) => {
      const matchesCategory = category === 'all' || product.category.toLowerCase() === category.toLowerCase();
      
      const searchLower = search.toLowerCase().trim();
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (searchLower === 'veggies' && product.category === 'vegetables') ||
        (searchLower === 'veg' && product.category === 'vegetables') ||
        (searchLower === 'beverage' && product.category === 'beverages') ||
        (searchLower === 'drinks' && product.category === 'beverages') ||
        (searchLower === 'drink' && product.category === 'beverages');
        
      return matchesCategory && matchesSearch;
    });
  }

  async getPopularProducts(): Promise<Product[]> {
    return localProductData.filter((p) => p.rating >= 4.8);
  }
}

export const productService = new ProductService();
