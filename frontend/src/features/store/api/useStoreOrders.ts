import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export interface CreatePosOrderItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  taxRate?: number;
  taxSplit?: any;
}

export interface CreatePosOrderPayload {
  storeId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'SPLIT';
  notes?: string;
  items: CreatePosOrderItemPayload[];
  staffId?: string;
}

/**
 * Single Responsibility: Store Orders, POS checkouts, Bills, and Click & Collect Pickups.
 */
export const useStoreOrders = (
  storeId?: string,
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: ['store-orders', storeId, filters],
    queryFn: async () => {
      const { data } = await api.get('/store/orders', { params: { storeId, ...filters } });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export const useCreatePosOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...payload }: CreatePosOrderPayload) => {
      const { data } = await api.post('/store/orders/pos', payload, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-batches'] });
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to complete POS sale.'));
    },
  });
};

export const useUpdateStoreOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status, storeId }: { orderId: string; status: string; storeId?: string }) => {
      const { data } = await api.patch(`/store/orders/${orderId}/status`, { status }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-pickup-queue'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useStorePickupQueue = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-pickup-queue', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/pickup', { params: { storeId } });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export const useVerifyPickupPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, pin, storeId }: { orderId: string; pin: string; storeId?: string }) => {
      const { data } = await api.post(`/store/pickup/${orderId}/verify`, { pin }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-pickup-queue'] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useStoreBills = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-bills', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/bills', { params: { storeId } });
      return data.data;
    },
  });
};
