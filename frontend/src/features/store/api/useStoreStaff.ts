import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Single Responsibility: Store Staff members, clock in/out, and shift assignments.
 */
export const useStoreStaff = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-staff', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/staff', { params: { storeId } });
      return data.data;
    },
  });
};

export const useCreateStoreStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/staff', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-staff'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useUpdateStoreStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, staffId, payload }: { storeId?: string; staffId: string; payload: any }) => {
      const { data } = await api.patch(`/store/staff/${staffId}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-staff'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useDeleteStoreStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, staffId }: { storeId?: string; staffId: string }) => {
      const { data } = await api.delete(`/store/staff/${staffId}`, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-staff'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useToggleStoreStaffClock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, staffId }: { storeId?: string; staffId: string }) => {
      const { data } = await api.patch(`/store/staff/${staffId}/clock`, {}, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-staff'] });
    },
  });
};

export const useUpdateStoreStaffShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, staffId, shift }: { storeId?: string; staffId: string; shift: string }) => {
      const { data } = await api.patch(`/store/staff/${staffId}/shift`, { shift }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-staff'] });
    },
  });
};
