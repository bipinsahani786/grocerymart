import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';
import { DeliveryOrder } from '../constants/mockData';

class PartnerOrdersService {
  /**
   * Poll/Fetch available incoming delivery order for this online rider
   */
  async getIncomingOrder(
    coords?: { lat: number; lng: number } | null,
    token?: string | null
  ): Promise<ApiResponse<DeliveryOrder | null>> {
    const params: Record<string, any> = {};
    if (coords?.lat && coords?.lng) {
      params.lat = coords.lat;
      params.lng = coords.lng;
    }
    return await apiClient.get<DeliveryOrder | null>(
      API_CONFIG.ENDPOINTS.PARTNER.ORDERS_INCOMING,
      { params, token }
    );
  }

  /**
   * Accept an incoming delivery order
   */
  async acceptOrder(orderId: string, token?: string | null): Promise<ApiResponse<DeliveryOrder>> {
    const endpoint = (API_CONFIG.ENDPOINTS.PARTNER as any).ORDERS_ACCEPT(orderId);
    return await apiClient.post<DeliveryOrder>(endpoint, {}, { token });
  }

  /**
   * Reject/Pass an incoming delivery order (passes order to next online rider in queue)
   */
  async rejectOrder(
    orderId: string,
    reason = 'Rider passed or timed out',
    token?: string | null
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const endpoint = (API_CONFIG.ENDPOINTS.PARTNER as any).ORDERS_REJECT(orderId);
    return await apiClient.post<{ success: boolean; message: string }>(
      endpoint,
      { reason },
      { token }
    );
  }

  /**
   * Fetch current active ongoing delivery order assigned to partner
   */
  async getActiveOrder(token?: string | null): Promise<ApiResponse<DeliveryOrder | null>> {
    return await apiClient.get<DeliveryOrder | null>(
      API_CONFIG.ENDPOINTS.PARTNER.ORDERS_ACTIVE,
      { token }
    );
  }

  /**
   * Update active delivery order status ('AT_STORE' | 'PICKED_UP' | 'OUT_FOR_DELIVERY')
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    token?: string | null
  ): Promise<ApiResponse<DeliveryOrder>> {
    const endpoint = (API_CONFIG.ENDPOINTS.PARTNER as any).ORDERS_STATUS(orderId);
    return await apiClient.post<DeliveryOrder>(endpoint, { status }, { token });
  }

  /**
   * Complete delivery with customer OTP verification
   */
  async completeDelivery(
    orderId: string,
    otp: string,
    token?: string | null
  ): Promise<ApiResponse<DeliveryOrder>> {
    const endpoint = (API_CONFIG.ENDPOINTS.PARTNER as any).ORDERS_COMPLETE(orderId);
    return await apiClient.post<DeliveryOrder>(endpoint, { otp }, { token });
  }

  /**
   * Fetch completed trips history for this partner
   */
  async getCompletedTrips(token?: string | null): Promise<ApiResponse<DeliveryOrder[]>> {
    return await apiClient.get<DeliveryOrder[]>(
      API_CONFIG.ENDPOINTS.PARTNER.ORDERS_TRIPS,
      { token }
    );
  }
}

export const partnerOrdersService = new PartnerOrdersService();
