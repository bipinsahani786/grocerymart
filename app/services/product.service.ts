import { apiClient } from './apiClient';
import { Product } from '../data/groceryData';

export interface ProductFilters {
  category?: string;
  search?: string;
  pincode?: string;
}

/**
 * Single Responsibility: Manages product catalog querying from the backend service.
 * Supports active pincode sourcing to evaluate inventory and out-of-stock statuses.
 */
export class ProductService {
  async fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/api/customer/products', {
      params: {
        category: filters.category,
        search: filters.search,
        pincode: filters.pincode || '10001',
      },
    });

    if (response.success && response.data) {
      return response.data;
    }
    
    // Return empty array on failure
    return [];
  }

  async getPopularProducts(): Promise<Product[]> {
    // Fetch from backend standard outlet and filter by rating
    const products = await this.fetchProducts({ category: 'all', pincode: '201301' });
    return products.filter((p) => p.rating >= 4.8);
  }

  async fetchLocationByPincode(pincode: string): Promise<{ storeName: string; address: string } | null> {
    const response = await apiClient.get<{ storeName: string; address: string }>('/api/customer/location-by-pincode', {
      params: { pincode },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async fetchStores(pincode?: string): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/customer/stores', {
      params: { pincode },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async fetchProfile(): Promise<any> {
    const response = await apiClient.get<any>('/api/customer/profile');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async fetchCustomerAddresses(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/customer/addresses');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async addCustomerAddress(data: { street: string; city: string; state: string; zipCode: string }): Promise<any> {
    const response = await apiClient.post<any>('/api/customer/addresses', data);
    return response.data;
  }

  async updateCustomerAddress(id: string, data: { street?: string; city?: string; state?: string; zipCode?: string }): Promise<any> {
    const response = await apiClient.put<any>(`/api/customer/addresses/${id}`, data);
    return response.data;
  }

  async deleteCustomerAddress(id: string): Promise<boolean> {
    const response = await apiClient.delete<any>(`/api/customer/addresses/${id}`);
    return !!response.success;
  }
}

export const productService = new ProductService();
