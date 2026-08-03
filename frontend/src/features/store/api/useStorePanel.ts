import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

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

export const useStoreProducts = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory', { params: { storeId } });
      const inventory = data.data || [];
      return inventory
        .map((item: any) => item.product)
        .filter(Boolean);
    },
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
      const res = data?.data;
      if (res && res.data) return res;
      if (Array.isArray(res)) return { data: res, meta: { total: res.length, page: 1, limit: res.length, totalPages: 1 } };
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
  });
};

export const useAllStoreCategories = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-categories-all', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/categories', { params: { storeId, all: 'true' } });
      const res = data?.data;
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
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

export const useStoreMasterCatalog = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-master-catalog', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/inventory/master-catalog', { params: { storeId } });
      return data.data;
    },
    enabled: true,
  });
};

export const useImportMasterProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, productIds }: { storeId?: string, productIds: string[] }) => {
      const { data } = await api.post('/store/inventory/import-master', { productIds }, { params: { storeId } });
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
export const useStoreOrders = (
  storeId?: string,
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: ['store-orders', storeId, filters],
    queryFn: async () => {
      const { data } = await api.get('/store/orders', { params: { storeId, ...filters } });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export interface CreatePosOrderItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  taxRate?: number;
  taxSplit?: any;
}

export interface CreatePosOrderPayload {
  storeId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'SPLIT';
  notes?: string;
  items: CreatePosOrderItemPayload[];
  staffId?: string;
}

export const useCreatePosOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...payload }: CreatePosOrderPayload) => {
      const { data } = await api.post('/store/orders/pos', payload, { params: { storeId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['store-batches'] });
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
      queryClient.invalidateQueries({ queryKey: ['store-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to complete POS sale.'));
    },
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

// ── Taxes ──
export const useStoreTaxes = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-taxes', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/taxes', { params: { storeId } });
      return data.data;
    },
  });
};
