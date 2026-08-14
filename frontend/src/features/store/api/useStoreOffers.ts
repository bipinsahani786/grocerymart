import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Offers, Discounts, and Promotions.
 */
export const useStoreOffers = (storeId?: string, params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['store-offers', storeId, params?.page, params?.limit, params?.search],
    queryFn: async () => {
      const { data } = await api.get('/store/offers', { 
        params: { 
          storeId,
          page: params?.page,
          limit: params?.limit,
          search: params?.search 
        } 
      });
      return {
        data: data.data || [],
        total: data.total || 0
      };
    },
  });
};

export const useCreateStoreOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/offers', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-offers'] });
    },
  });
};

export const useUpdateStoreOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, offerId, payload }: { storeId?: string; offerId: string; payload: any }) => {
      const { data } = await api.patch(`/store/offers/${offerId}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-offers'] });
    },
  });
};

export const useDeleteStoreOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, offerId }: { storeId?: string; offerId: string }) => {
      const { data } = await api.delete(`/store/offers/${offerId}`, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-offers'] });
    },
  });
};
