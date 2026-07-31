import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  FolderTree,
  Download,
  ChevronRight,
  ChevronDown,
  FolderOpen
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  useStoreCategories,
  useAllStoreCategories,
  useCreateStoreCategory,
  useUpdateStoreCategory,
  useDeleteStoreCategory,
  useImportMasterCategories,
  useUploadStoreImage
} from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { SearchBar } from '@/components/ui/SearchBar';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { StoreCategoryFormModal } from '../components/StoreCategoryFormModal';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';

export default function StoreCategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Tab and navigation state
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentParentId = activeTab === 'categories'
    ? 'null'
    : (selectedParentId || 'not_null');

  const { data: categoriesData } = useStoreCategories(storeId, {
    page,
    limit,
    search: searchQuery,
    parentId: currentParentId
  });
  const { data: allCategories } = useAllStoreCategories(storeId);
  const createCategory = useCreateStoreCategory();
  const updateCategory = useUpdateStoreCategory();
  const deleteCategory = useDeleteStoreCategory();
  const importMasterCategories = useImportMasterCategories();
  const uploadImage = useUploadStoreImage();

  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const meta = categoriesData?.meta;
  const flatCategories = Array.isArray(allCategories) ? allCategories : (Array.isArray(allCategories?.data) ? allCategories.data : []);

  // KPI computations
  const totalCategories = flatCategories.length;
  const rootCategories = flatCategories.filter((c: any) => !c.parentId).length;
  const totalSubcategories = totalCategories - rootCategories;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);

  // Form states
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImportMaster = () => {
    importMasterCategories.mutate(
      { storeId },
      {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Master categories imported successfully!');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to import master categories');
        },
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setFormImageUrl(localPreviewUrl);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    uploadImage.mutate(formData, {
      onSuccess: (data: any) => {
        if (data?.url) {
          setFormImageUrl(data.url);
          toast.success('Category image uploaded successfully!');
        }
        setIsUploading(false);
      },
      onError: (err: any) => {
        setFormImageUrl('');
        toast.error(err.response?.data?.message || 'Failed to upload image');
        setIsUploading(false);
      }
    });
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormParentId(currentParentId === 'not_null' ? '' : (currentParentId === 'null' ? '' : (currentParentId || '')));
    setFormImageUrl('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormParentId(cat.parentId || '');
    setFormImageUrl(cat.imageUrl || '');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error('Category name is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      parentId: formParentId || null,
      imageUrl: formImageUrl || null
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, storeId, payload },
        {
          onSuccess: () => {
            toast.success(`Category "${formName}" updated successfully`);
            setIsFormModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update category');
          }
        }
      );
    } else {
      createCategory.mutate(
        { storeId, payload },
        {
          onSuccess: () => {
            toast.success(`Category "${formName}" created successfully`);
            setIsFormModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create category');
          }
        }
      );
    }
  };

  const handleTabChange = (tab: 'categories' | 'subcategories') => {
    setActiveTab(tab);
    if (tab === 'categories') {
      setSelectedParentId(null);
    }
    setSearchQuery('');
    setPage(1);
  };

  const navigateTo = (cat: any) => {
    setSelectedParentId(cat.id);
    setActiveTab('subcategories');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  // Map subcategories count and product count
  const displayedCategories = useMemo(() => {
    return categories.map((cat: any) => ({
      ...cat,
      productCount: cat._count?.products || 0,
      subcategoriesCount: cat.children?.length || 0
    }));
  }, [categories]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Layers}
        title="Product Categories"
        subtitle="Manage product category trees, groups, and catalog tax defaults"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-4 pb-6">

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <CustomKpiCard
            title="Total Categories"
            value={totalCategories}
            subtitle="All active categories"
            icon={<Layers />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Root Categories"
            value={rootCategories}
            subtitle="Top-level categories"
            icon={<FolderTree />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
          <CustomKpiCard
            title="Subcategories"
            value={totalSubcategories}
            subtitle="Nested categories"
            icon={<FolderOpen />}
            colorClass="bg-primary-500"
            iconColorClass="bg-white/20 text-white"
          />
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-6 border-b border-border w-full sm:w-auto">
            <button
              onClick={() => handleTabChange('categories')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'categories'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              Category
            </button>
            <button
              onClick={() => handleTabChange('subcategories')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subcategories'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              Subcategory
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search categories..."
              />
            </div>
            <Button onClick={handleOpenCreateModal} className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white shadow-sm font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'subcategories' ? 'Subcategory' : 'Category'}
            </Button>
          </div>
        </div>


        {/* Categories Table */}
        <Card>
          <CardHeader className="border-b border-border bg-muted/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary-500" />
                  {searchQuery ? 'Search Results' : (activeTab === 'subcategories' ? 'Subcategories' : 'Categories')}
                  {meta && <Badge variant="secondary" className="ml-2 font-bold">{meta.total}</Badge>}
                </CardTitle>
                <CardDescription>
                  {searchQuery ? 'Showing matching categories' : 'Click a category to view its subcategories'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportMaster}
                disabled={importMasterCategories.isPending}
                className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hidden sm:flex"
              >
                <Download className="h-4 w-4 text-emerald-500" />
                Import Master Categories
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {displayedCategories.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <FolderOpen className="h-12 w-12 text-slate-200 dark:text-slate-800 mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Categories Found</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {searchQuery ? "Try adjusting your search query." : "This category doesn't have any subcategories yet."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenCreateModal} variant="outline" size="sm" className="font-semibold">
                    <Plus className="w-4 h-4 mr-2" /> Create One Now
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">
                        {activeTab === 'categories' ? 'Category' : 'Subcategory'}
                      </th>
                      <th className="px-4 py-3 font-semibold">Subcategories</th>
                      <th className="px-4 py-3 font-semibold">Products</th>
                      <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedCategories.map((cat: any) => (
                      <React.Fragment key={cat.id}>
                        <tr
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={(e) => {
                            if (activeTab === 'categories') {
                              navigateTo(cat);
                            } else {
                              toggleRow(cat.id, e);
                            }
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {activeTab === 'subcategories' && cat.subcategoriesCount > 0 ? (
                                expandedRowIds.has(cat.id) ? 
                                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary-500 shrink-0" /> : 
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 shrink-0" />
                              )}
                              <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center overflow-hidden shadow-sm">
                                <SafeCategoryImage src={cat.imageUrl} alt={cat.name} type="category" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                  {cat.name}
                                </h4>
                                {activeTab === 'subcategories' && cat.parent?.name && (
                                  <span className="text-[10px] font-semibold text-muted-foreground">
                                    Parent: {cat.parent.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            {cat.subcategoriesCount > 0 ? (
                              <Badge variant="secondary" className="font-bold text-xs bg-slate-100 text-slate-700">
                                {cat.subcategoriesCount} subcategories
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <Badge variant={cat.productCount > 0 ? 'success' : 'outline'} className="font-bold text-[10px]">
                              {cat.productCount} products
                            </Badge>
                          </td>
                          <td className="px-4 py-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cat); }}
                              >
                                <Edit3 className="h-4 w-4 text-primary-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                onClick={(e) => { e.stopPropagation(); setDeletingCategory(cat); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRowIds.has(cat.id) && cat.children && cat.children.length > 0 && (
                          <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-border">
                            <td colSpan={4} className="p-4">
                               <div className="pl-14">
                                  <h5 className="font-bold text-xs text-slate-500 uppercase mb-3 tracking-wider">Subcategories of {cat.name}</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {cat.children.map((sub: any) => (
                                      <div 
                                        key={sub.id} 
                                        className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary-500 hover:shadow-md transition-all group/sub" 
                                        onClick={(e) => { e.stopPropagation(); navigateTo(sub); }}
                                      >
                                        <div className="w-8 h-8 rounded-md border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex shrink-0 items-center justify-center overflow-hidden">
                                          <SafeCategoryImage src={sub.imageUrl} alt={sub.name} type="category" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover/sub:text-primary-600 transition-colors">{sub.name}</div>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover/sub:text-primary-500 shrink-0 mr-1 opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                                      </div>
                                    ))}
                                  </div>
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <CustomDropdown
                    value={limit}
                    onChange={(val) => {
                      setLimit(Number(val));
                      setPage(1);
                    }}
                    options={[
                      { value: 10, label: '10' },
                      { value: 20, label: '20' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                    ]}
                    triggerClassName="!w-[65px] !h-7 !px-2 !py-0 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    menuClassName="min-w-0 w-full"
                  />
                  <span>entries</span>
                </div>
                <div className="hidden sm:block">
                  Showing {Math.min((meta.page - 1) * limit + 1, meta.total)} to {Math.min(meta.page * limit, meta.total)} of {meta.total} results
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="flex-1 sm:flex-none"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Modals */}
      <StoreCategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        editingCategory={editingCategory}
        isSubcategoryMode={activeTab === 'subcategories' && !editingCategory}
        name={formName}
        setName={setFormName}
        parentId={formParentId}
        setParentId={setFormParentId}
        imageUrl={formImageUrl}
        setImageUrl={setFormImageUrl}
        isUploading={isUploading}
        handleImageUpload={handleImageUpload}
        handleSubmit={handleFormSubmit}
        flatCategories={flatCategories}
        isPending={createCategory.isPending || updateCategory.isPending}
      />

      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (!deletingCategory) return;
          if (deletingCategory._count?.products > 0) {
            toast.error(`Cannot delete "${deletingCategory.name}" because it contains active products.`);
            setDeletingCategory(null);
            return;
          }
          deleteCategory.mutate(
            { id: deletingCategory.id, storeId },
            {
              onSuccess: () => {
                toast.success(`Category "${deletingCategory.name}" deleted successfully.`);
                setDeletingCategory(null);
              },
              onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to delete category');
              }
            }
          );
        }}
        title="Delete Category"
        description={`Are you sure you want to delete '${deletingCategory?.name}'?`}
        requireTyping={false}
      />
    </div>
  );
}
