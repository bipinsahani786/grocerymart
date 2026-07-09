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
