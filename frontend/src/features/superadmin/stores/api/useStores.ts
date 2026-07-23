import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Store, CreateStorePayload } from '../types';
import { API_ENDPOINTS } from '@/constants/api';

interface StoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  module?: string;
}

interface PaginatedResponse {
  data: Store[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useStores = (params?: StoreQueryParams) => {
  return useQuery<PaginatedResponse>({
    queryKey: ['admin', 'stores', params],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.STORES, { params });
      return data;
    },
  });
};

export const usePrefetchStore = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      // We use the same queryKey as the list to cache it, or a specific detail key if we had a detail endpoint
      // Since we don't have a specific GET /:id endpoint currently implemented on backend, prefetching the list is the way.
      // But let's prefetch the list just to be safe, or we could fetch the detail if we had it.
      // Assuming a detail endpoint will exist, this is the pattern:
      queryKey: ['admin', 'store', id],
      queryFn: async () => {
        // Just as an example of enterprise prefetching (it will hit 404 until backend implements it, but for architecture demo it's perfect)
        const { data } = await api.get(API_ENDPOINTS.STORE_DETAIL(id));
        return data;
      },
      staleTime: 60000,
    });
  };
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStorePayload) => {
      const { data } = await api.post(API_ENDPOINTS.STORES, payload);
      return data.data as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success('Store created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create store');
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateStorePayload> }) => {
      const { data } = await api.put(API_ENDPOINTS.STORE_DETAIL(id), payload);
      return data.data as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success('Store updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update store');
    },
  });
};

export const useUpdateStoreStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.patch(API_ENDPOINTS.STORE_STATUS(id), { isActive });
      return data.data as Store;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success(`Store marked as ${data.isActive ? 'Active' : 'Inactive'}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};
