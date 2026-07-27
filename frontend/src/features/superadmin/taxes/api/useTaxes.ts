import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TaxClass, TaxRate } from '../schemas/taxSchemas';
import { toast } from 'sonner';

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
      toast.success('Tax profile created successfully');
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create tax profile');
    },
  });

  const updateTaxClass = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name?: string;
        description?: string | null;
        isActive?: boolean;
      };
    }) => {
      const { data } = await api.put(`/admin/taxes/${id}`, payload);
      return data.data as TaxClass;
    },
    onSuccess: () => {
      toast.success('Tax profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update tax profile');
    },
  });

  const deleteTaxClass = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/taxes/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Tax profile deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete tax profile');
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
      toast.success('Tax rate scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['superadmin-taxes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule tax rate');
    },
  });

  return {
    taxes: taxesQuery.data || [],
    isLoading: taxesQuery.isLoading,
    isError: taxesQuery.isError,
    error: taxesQuery.error,
    createTaxClass,
    updateTaxClass,
    deleteTaxClass,
    scheduleTaxRate,
  };
}
