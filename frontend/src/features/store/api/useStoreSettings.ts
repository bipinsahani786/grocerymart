import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Settings queries and mutation hooks.
 */
export const useStoreSettings = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-settings', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/settings', { params: { storeId } });
      return data.data;
    },
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.patch('/store/settings', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};
