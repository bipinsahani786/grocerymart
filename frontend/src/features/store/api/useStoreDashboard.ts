import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Query hooks for Store Manager Dashboard.
 */
export const useStoreDashboard = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-dashboard', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/dashboard', { 
        params: { storeId, _t: Date.now() } 
      });
      return data.data;
    },
    refetchInterval: 30000,
  });
};
