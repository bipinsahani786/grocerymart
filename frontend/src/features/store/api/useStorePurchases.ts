import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

// ── Suppliers ──
export const useSuppliers = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-suppliers', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/purchases/suppliers', { params: { storeId } });
      return data.data;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...payload }: { storeId?: string; name: string; phone: string; contactPerson?: string; email?: string; gstin?: string; address?: string; city?: string; state?: string; pincode?: string }) => {
      const { data } = await api.post('/store/purchases/suppliers', payload, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-suppliers', variables.storeId] });
      toast.success('Supplier registered successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to register supplier.');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId, ...payload }: { id: string; storeId?: string; name?: string; phone?: string; contactPerson?: string; email?: string; gstin?: string; address?: string }) => {
      const { data } = await api.patch(`/store/purchases/suppliers/${id}`, payload, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-suppliers', variables.storeId] });
      toast.success('Supplier updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update supplier.');
    },
  });
};

// ── Purchase Orders ──
export const usePurchaseOrders = (storeId?: string) => {
  return useQuery({
    queryKey: ['store-purchase-orders', storeId],
    queryFn: async () => {
      const { data } = await api.get('/store/purchases/orders', { params: { storeId } });
      return data.data;
    },
  });
};

export const usePurchaseOrder = (id?: string, storeId?: string) => {
  return useQuery({
    queryKey: ['store-purchase-order', id, storeId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/store/purchases/orders/${id}`, { params: { storeId } });
      return data.data;
    },
    enabled: Boolean(id),
  });
};

export interface CreatePurchaseOrderItemPayload {
  productId: string;
  variantId?: string;
  batchNumber?: string;
  quantity: number;
  costPrice: number;
  mrp?: number;
  sellingPrice: number;
  taxRate?: number;
  hsnCode?: string;
  expiryDate?: string;
}

export interface CreatePurchaseOrderPayload {
  storeId?: string;
  supplierId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...payload }: CreatePurchaseOrderPayload) => {
      const { data } = await api.post('/store/purchases/orders', payload, { params: { storeId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store-purchase-orders', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-batches', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-inventory', variables.storeId] });
      toast.success('Inward Purchase Order & Stock Batches created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create inward purchase order.');
    },
  });
};

// ── Store Inventory Batches ──
export const useStoreBatches = (storeId?: string, productId?: string) => {
  return useQuery({
    queryKey: ['store-batches', storeId, productId],
    queryFn: async () => {
      const { data } = await api.get('/store/purchases/batches', { params: { storeId, productId } });
      return data.data;
    },
  });
};
