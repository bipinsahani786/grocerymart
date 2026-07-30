import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ── Store Dashboard ──
export const useStoreDashboard = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-dashboard', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/dashboard', { params: { storeId } });
      return data.data;
    },
    refetchInterval: 30000,
  });
};

// ── Store Settings ──
export const useStoreSettings = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-settings', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/settings', { params: { storeId } });
      return data.data;
    },
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.patch('/store/settings', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

// ── Store Categories ──
export const useStoreCategories = (storeId?: string, params?: { page?: number; limit?: number; search?: string; parentId?: string | null }) => {
  return useQuery({
    queryKey: ['store-categories', storeId, params],
    queryFn: async () => {
      const { data } = await api.get('/store/categories', { params: { storeId, ...params } });
      return data.data; // returning { data, meta }
    },
  });
};

export const useAllStoreCategories = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-categories-all', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/categories', { params: { storeId, all: 'true' } });
      return data.data.data; // returning just the array
    },
  });
};

export const useCreateStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/categories', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useUpdateStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId, payload }: { id: string; storeId?: string; payload: any }) => {
      const { data } = await api.patch(`/store/categories/${id}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useDeleteStoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId?: string }) => {
      const { data } = await api.delete(`/store/categories/${id}`, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
    },
  });
};

export const useImportMasterCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId }: { storeId?: string } = {}) => {
      const { data } = await api.post('/store/categories/import-master', {}, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

// ── Store Inventory & Products ──
export const useStoreInventory = (storeId?: string, query?: string) => {
  return useQuery({
    queryKey: ['store-inventory', storeId, query],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory', { params: { storeId, q: query } });
      return data.data;
    },
  });
};

export const useCreateStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: { storeId?: string; payload: any }) => {
      const { data } = await api.post('/store/inventory', payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useImportMasterProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId }: { storeId?: string } = {}) => {
      const { data } = await api.post('/store/inventory/import-master', {}, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useUploadStoreImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/store/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data; // expects { url: string }
    },
  });
};

export const useUpdateStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, storeId, payload }: { productId: string; storeId?: string; payload: any }) => {
      const { data } = await api.patch(`/store/inventory/${productId}`, payload, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useDeleteStoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, storeId }: { productId: string; storeId?: string }) => {
      const { data } = await api.delete(`/store/inventory/${productId}`, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

export const useAdjustStoreStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, delta, storeId }: { productId: string; delta: number; storeId?: string }) => {
      const { data } = await api.patch(`/store/inventory/${productId}/adjust`, { delta }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

// ── Store Orders ──
export const useStoreOrders = (storeId?: string, filters?: { type?: string; status?: string }) => {
  return useQuery({
    queryKey: ['store-orders', storeId, filters],
    queryFn: async () => {
      const { data } = await api.get('/store/orders', { params: { storeId, ...filters } });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export const useUpdateStoreOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status, storeId }: { orderId: string; status: string; storeId?: string }) => {
      const { data } = await api.patch(`/store/orders/${orderId}/status`, { status }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-pickup-queue'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

// ── Click & Collect Pickup ──
export const useStorePickupQueue = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-pickup-queue', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/pickup', { params: { storeId } });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export const useVerifyPickupPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, pin, storeId }: { orderId: string; pin: string; storeId?: string }) => {
      const { data } = await api.post(`/store/pickup/${orderId}/verify`, { pin }, { params: { storeId } });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-pickup-queue'] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
  });
};

// ── Bills ──
export const useStoreBills = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-bills', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/bills', { params: { storeId } });
      return data.data;
    },
  });
};

// ── Customers ──
export const useStoreCustomers = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-customers', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/customers', { params: { storeId } });
      return data.data;
    },
  });
};

// ── Staff ──
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

// ── Analytics ──
export const useStoreAnalytics = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-analytics', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/analytics', { params: { storeId } });
      return data.data;
    },
  });
};
