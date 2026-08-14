import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Analytics queries.
 */
export const useStoreAnalytics = (storeId?: string, range?: string) => {
  return useQuery({
    queryKey: ['store-analytics', storeId, range],
    queryFn: async () => {
      const { data } = await api.get('/store/analytics', { params: { storeId, range } });
      return data.data;
    },
  });
};
