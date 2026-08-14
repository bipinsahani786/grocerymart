import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Products & Inventory management hooks.
 */
export const useStoreProducts = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory', { params: { storeId } });
      const inventory = data.data || [];
      return inventory
        .map((item: any) => item.product || item)
        .filter(Boolean);
    },
  });
};

export const useStoreInventory = (storeId?: string, query?: string) => {
  return useQuery({
    queryKey: ['store-inventory', storeId, query],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory', { params: { storeId, q: query } });
      return data.data;
    },
  });
};

export const useCreateStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/inventory', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useStoreMasterCatalog = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-master-catalog', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory/master-catalog', { params: { storeId } });
      return data.data;
    },
    enabled: true,
  });
};

export const useImportMasterProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, productIds }: { storeId?: string, productIds: string[] }) => {
      const { data } = await api.post('/store/inventory/import-master', { productIds }, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useUploadStoreImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/store/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data; // expects { url: string }
    },
  });
};

export const useUpdateStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, storeId, payload }: { productId: string; storeId?: string; payload: any }) => {
      const { data } = await api.patch(`/store/inventory/${productId}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useDeleteStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, storeId }: { productId: string; storeId?: string }) => {
      const { data } = await api.delete(`/store/inventory/${productId}`, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useAdjustStoreStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, delta, storeId }: { productId: string; delta: number; storeId?: string }) => {
      const { data } = await api.patch(`/store/inventory/${productId}/adjust`, { delta }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};
