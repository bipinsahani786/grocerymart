import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MasterCategory, MasterProduct } from '../schemas/catalogSchemas';

export function useMasterCatalog() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['master-categories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/catalog/categories');
      // Structure the flat data into a tree
      const categories: MasterCategory[] = data.data;
      const root: MasterCategory[] = [];
      const map = new Map<string, MasterCategory>();
      
      categories.forEach(c => map.set(c.id!, { ...c, children: [] }));
      
      categories.forEach(c => {
        if (c.parentId) {
          const parent = map.get(c.parentId);
          if (parent) {
            parent.children!.push(map.get(c.id!)!);
          }
        } else {
          root.push(map.get(c.id!)!);
        }
      });
      
      return { flat: categories, tree: root };
    },
  });

  const productsQuery = useQuery({
    queryKey: ['master-products'],
    queryFn: async () => {
      const { data } = await api.get('/admin/catalog/products');
      return data.data as MasterProduct[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (payload: MasterCategory) => {
      const { data } = await api.post('/admin/catalog/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<MasterCategory> }) => {
      const { data } = await api.put(`/admin/catalog/categories/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['master-products'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/catalog/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-categories'] });
      queryClient.invalidateQueries({ queryKey: ['master-products'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const createProduct = useMutation({
    mutationFn: async (payload: MasterProduct) => {
      const { data } = await api.post('/admin/catalog/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-products'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<MasterProduct> }) => {
      const { data } = await api.put(`/admin/catalog/products/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-products'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/catalog/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-products'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
    },
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/admin/catalog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data.url as string;
    },
  });

  return {
    categories: categoriesQuery.data?.tree || [],
    flatCategories: categoriesQuery.data?.flat || [],
    isLoadingCategories: categoriesQuery.isLoading,
    
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,

    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
  };
}
