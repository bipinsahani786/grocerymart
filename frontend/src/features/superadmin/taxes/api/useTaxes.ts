import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TaxClass, TaxRate } from '../schemas/taxSchemas';

export function useTaxes() {
  const queryClient = useQueryClient();

  const taxesQuery = useQuery({
    queryKey: ['superadmin-taxes'],
    queryFn: async () => {
      const { data } = await api.get('/admin/taxes');
      return data.data as TaxClass[];
    },
  });

  const createTaxClass = useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      initialRate?: {
        effectiveFrom: string;
        components: { name: string; rate: number }[];
      };
    }) => {
      const { data } = await api.post('/admin/taxes', payload);
      return data.data as TaxClass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
  });

  const scheduleTaxRate = useMutation({
    mutationFn: async ({
      taxClassId,
      payload,
    }: {
      taxClassId: string;
      payload: {
        effectiveFrom: string;
        components: { name: string; rate: number }[];
      };
    }) => {
      const { data } = await api.post(`/admin/taxes/${taxClassId}/rates`, payload);
      return data.data as TaxRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
  });

  return {
    taxes: taxesQuery.data || [],
    isLoading: taxesQuery.isLoading,
    isError: taxesQuery.isError,
    error: taxesQuery.error,
    createTaxClass,
    scheduleTaxRate,
  };
}
