import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

/**
 * Single Responsibility: Store Customers and Khata Ledger management hooks.
 */
export const useStoreCustomers = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/customers', { params: { storeId } });
      return data.data;
    },
  });
};

export const useCreateStoreCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...payload }: { storeId?: string; name: string; phone: string; email?: string; notes?: string; khataBalance?: number }) => {
      const { data } = await api.post('/store/customers', payload, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.storeId] });
      toast.success('Customer registered successfully!');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to register customer.'));
    },
  });
};

export const useUpdateStoreCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId, ...payload }: { id: string; storeId?: string; name?: string; phone?: string; email?: string; notes?: string; khataBalance?: number; loyaltyPoints?: number }) => {
      const { data } = await api.patch(`/store/customers/${id}`, payload, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.storeId] });
      toast.success('Customer updated successfully!');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to update customer.'));
    },
  });
};

export const useDeleteStoreCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId?: string }) => {
      const { data } = await api.delete(`/store/customers/${id}`, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-customers', variables.storeId] });
      toast.success('Customer deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to delete customer.'));
    },
  });
};
