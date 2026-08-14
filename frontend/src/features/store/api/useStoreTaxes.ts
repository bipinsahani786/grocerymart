import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Tax rates and classes queries.
 */
export const useStoreTaxes = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-taxes', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/taxes', { params: { storeId } });
      return data.data;
    },
  });
};
