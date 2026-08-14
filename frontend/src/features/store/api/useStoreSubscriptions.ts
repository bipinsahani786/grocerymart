import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store VIP Subscriptions queries and mutations.
 */
export const useStoreSubscriptions = (storeId?: string, params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['store-subscriptions', storeId, params?.page, params?.limit, params?.search],
    queryFn: async () => {
      const { data } = await api.get('/store/subscriptions', { 
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

export const useCreateStoreSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/subscriptions', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-subscriptions'] });
    },
  });
};

export const useUpdateStoreSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, subscriptionId, payload }: { storeId?: string; subscriptionId: string; payload: any }) => {
      const { data } = await api.patch(`/store/subscriptions/${subscriptionId}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-subscriptions'] });
    },
  });
};

export const useDeleteStoreSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, subscriptionId }: { storeId?: string; subscriptionId: string }) => {
      const { data } = await api.delete(`/store/subscriptions/${subscriptionId}`, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-subscriptions'] });
    },
  });
};
