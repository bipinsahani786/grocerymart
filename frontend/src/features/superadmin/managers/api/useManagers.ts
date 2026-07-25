import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface StoreManager {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    address: string;
  } | null;
  managedStore?: {
    id: string;
    name: string;
    address: string;
  } | null;
  role?: {
    roleName: string;
  } | null;
}

export interface CreateManagerPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  storeId?: string | null;
}

export const useManagers = () => {
  return useQuery<StoreManager[]>({
    queryKey: ['admin', 'managers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/managers');
      return data.data;
    },
  });
};

export const useCreateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateManagerPayload) => {
      const { data } = await api.post('/admin/managers', payload);
      return data.data as StoreManager;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success('Store manager created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create manager');
    },
  });
};

export const useUpdateManagerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/managers/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      toast.success('Manager status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useUpdateManagerPassword = () => {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const { data } = await api.patch(`/admin/managers/${id}/password`, { password });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Manager password updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });
};

export const useUpdateManagerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateManagerPayload> }) => {
      const { data } = await api.put(`/admin/managers/${id}`, payload);
      return data.data as StoreManager;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success('Store manager profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update manager profile');
    },
  });
};
