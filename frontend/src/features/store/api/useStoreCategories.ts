import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Category queries and mutations.
 */
export const useStoreCategories = (storeId?: string, params?: { page?: number; limit?: number; search?: string; parentId?: string | null }) => {
  return useQuery({
    queryKey: ['store-categories', storeId, params],
    queryFn: async () => {
      const { data } = await api.get('/store/categories', { params: { storeId, ...params } });
      const res = data?.data;
      if (res && res.data) return res;
      if (Array.isArray(res)) return { data: res, meta: { total: res.length, page: 1, limit: res.length, totalPages: 1 } };
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
  });
};

export const useAllStoreCategories = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-categories-all', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/categories', { params: { storeId, all: 'true' } });
      const res = data?.data;
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });
};

export const useCreateStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/categories', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useUpdateStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId, payload }: { id: string; storeId?: string; payload: any }) => {
      const { data } = await api.patch(`/store/categories/${id}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useDeleteStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId?: string }) => {
      const { data } = await api.delete(`/store/categories/${id}`, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useImportMasterCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId }: { storeId?: string } = {}) => {
      const { data } = await api.post('/store/categories/import-master', {}, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};
