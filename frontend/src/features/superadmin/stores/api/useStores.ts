import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  radiusKm: number;
  phone: string | null;
  gstin: string | null;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  posEnabled: boolean;
  deliveryEnabled: boolean;
  clickCollectEnabled: boolean;
  createdAt: string;
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;
  _count?: {
    users: number;
  };
}

export interface CreateStorePayload {
  name: string;
  address: string;
  lat: number;
  long: number;
  radiusKm: number;
  phone?: string;
  gstin?: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  posEnabled: boolean;
  deliveryEnabled: boolean;
  clickCollectEnabled: boolean;
}

export const useStores = () => {
  return useQuery<Store[]>({
    queryKey: ['admin', 'stores'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stores');
      return data.data;
    },
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStorePayload) => {
      const { data } = await api.post('/admin/stores', payload);
      return data.data as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      toast.success('Store created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create store');
    },
  });
};
