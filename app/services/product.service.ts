import { apiClient } from './apiClient';
import { AsyncStorageService, STORAGE_KEYS } from './storage.service';
import { Product, Category } from '../data/groceryData';

const storageService = new AsyncStorageService();

export interface ProductFilters {
  category?: string;
  search?: string;
  pincode?: string;
  storeId?: string;
}

export interface CategoryFilters {
  pincode?: string;
  storeId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'FLAT' | 'PERCENT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  endDate?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
  error?: string;
}

export interface DeliveryConfig {
  storeId?: string | null;
  storeName?: string;
  storeAddress?: string;
  distanceKm?: number;
  standardDeliveryFee: number;
  calculatedDeliveryFee?: number;
  freeDeliveryThreshold: number;
  taxRatePercent: number;
  deliveryChargePerKm: number;
  freeDeliveryKmRadius: number;
  minDeliveryCharge: number;
  isFreeDelivery?: boolean;
  deliveryRuleReason?: string;
  deliveryEnabled: boolean;
  clickCollectEnabled: boolean;
}

export class ProductService {
  async fetchCategories(filters: CategoryFilters | string = {}): Promise<Category[]> {
    const params = typeof filters === 'string' ? { pincode: filters } : filters;
    const response = await apiClient.get<Category[]>('/api/customer/categories', {
      params: {
        ...(params.pincode ? { pincode: params.pincode } : {}),
        ...(params.storeId ? { storeId: params.storeId } : {}),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/api/customer/products', {
      params: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.pincode ? { pincode: filters.pincode } : {}),
        ...(filters.storeId ? { storeId: filters.storeId } : {}),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async getPopularProducts(pincode?: string): Promise<Product[]> {
    const products = await this.fetchProducts({ category: 'all', pincode });
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

  async fetchStores(pincode?: string, userLat?: number, userLng?: number): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/customer/stores', {
      params: {
        ...(pincode ? { pincode } : {}),
        ...(userLat ? { userLat } : {}),
        ...(userLng ? { userLng } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async fetchNearbyStore(pincode?: string, userLat?: number, userLng?: number): Promise<any | null> {
    const response = await apiClient.get<any>('/api/customer/stores/nearby', {
      params: {
        ...(pincode ? { pincode } : {}),
        ...(userLat ? { userLat } : {}),
        ...(userLng ? { userLng } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }


  async fetchDeliveryConfig(
    paramsOrStoreId?:
      | {
          storeId?: string;
          pincode?: string;
          distanceKm?: number;
          subtotal?: number;
          userLat?: number;
          userLng?: number;
        }
      | string,
    pincodeParam?: string
  ): Promise<DeliveryConfig | null> {
    let params: Record<string, any> = {};
    if (typeof paramsOrStoreId === 'string') {
      params = {
        storeId: paramsOrStoreId,
        ...(pincodeParam ? { pincode: pincodeParam } : {}),
      };
    } else if (paramsOrStoreId && typeof paramsOrStoreId === 'object') {
      params = paramsOrStoreId;
    }
    const response = await apiClient.get<DeliveryConfig>('/api/customer/delivery-rate', {
      params: {
        ...params,
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async fetchCoupons(storeId?: string, pincode?: string): Promise<Coupon[]> {
    const response = await apiClient.get<Coupon[]>('/api/customer/offers', {
      params: {
        ...(storeId ? { storeId } : {}),
        ...(pincode ? { pincode } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async validateCoupon(
    code: string,
    subtotal: number,
    storeId?: string,
    pincode?: string
  ): Promise<CouponValidationResult> {
    const response = await apiClient.post<any>('/api/customer/offers/validate', {
      code,
      subtotal,
      storeId,
      pincode,
    });

    if (response.success && response.data) {
      return {
        valid: true,
        coupon: response.data.coupon,
        discountAmount: response.data.discountAmount || 0,
        message: response.data.message || response.message,
      };
    }

    return {
      valid: false,
      discountAmount: 0,
      error: response.error || response.message || 'Unable to apply coupon.',
    };
  }

  async fetchProfile(userId?: string, phone?: string): Promise<any> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = await storageService.getItem<any>(STORAGE_KEYS.AUTH_USER);
    const finalUserId = userId || storedUser?.id;
    const finalPhone = phone || storedUser?.phone;

    const response = await apiClient.get<any>('/api/customer/profile', {
      token,
      params: {
        ...(finalUserId ? { userId: finalUserId } : {}),
        ...(finalPhone ? { phone: finalPhone } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async fetchCustomerAddresses(userId?: string, phone?: string): Promise<any[]> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = await storageService.getItem<any>(STORAGE_KEYS.AUTH_USER);
    const finalUserId = userId || storedUser?.id;
    const finalPhone = phone || storedUser?.phone;

    const response = await apiClient.get<any[]>('/api/customer/addresses', {
      token,
      params: {
        ...(finalUserId ? { userId: finalUserId } : {}),
        ...(finalPhone ? { phone: finalPhone } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async addCustomerAddress(data: { street: string; city: string; state: string; zipCode: string; userId?: string; phone?: string }): Promise<any> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = await storageService.getItem<any>(STORAGE_KEYS.AUTH_USER);
    const payload = {
      ...data,
      userId: data.userId || storedUser?.id,
      phone: data.phone || storedUser?.phone,
    };
    const response = await apiClient.post<any>('/api/customer/addresses', payload, { token });
    return response.data;
  }

  async updateCustomerAddress(id: string, data: { street?: string; city?: string; state?: string; zipCode?: string }): Promise<any> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const response = await apiClient.put<any>(`/api/customer/addresses/${id}`, data, { token });
    return response.data;
  }

  async deleteCustomerAddress(id: string): Promise<boolean> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const response = await apiClient.delete<any>(`/api/customer/addresses/${id}`, { token });
    return !!response.success;
  }

  async createOrder(payload: {
    customerId?: string;
    userPhone?: string;
    userEmail?: string | null;
    storeId?: string;
    addressId?: string;
    deliveryAddress?: string;
    fulfillmentMode: 'delivery' | 'pickup';
    items: Array<{ id: string; name: string; price: number; quantity: number; weight?: string }>;
    subtotal: number;
    discount?: number;
    discountReason?: string;
    taxAmount?: number;
    deliveryFee?: number;
    totalAmount: number;
    customerNote?: string;
    paymentMethod: 'cod' | 'wallet' | 'upi' | 'card';
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const response = await apiClient.post<any>('/api/customer/orders', payload, { token });
    return response;
  }

  async fetchMyOrders(userId?: string, phone?: string): Promise<any[]> {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = await storageService.getItem<any>(STORAGE_KEYS.AUTH_USER);
    const finalUserId = userId || storedUser?.id;
    const finalPhone = phone || storedUser?.phone;

    const response = await apiClient.get<any[]>('/api/customer/orders', {
      token,
      params: {
        ...(finalUserId ? { userId: finalUserId } : {}),
        ...(finalPhone ? { phone: finalPhone } : {}),
        _t: Date.now(),
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
}

export const productService = new ProductService();
