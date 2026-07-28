import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  FolderTree, 
  Tag, 
  FolderPlus,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { 
  useStoreCategories, 
  useCreateStoreCategory, 
  useUpdateStoreCategory, 
  useDeleteStoreCategory,
  useImportMasterCategories 
} from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { SearchBar } from '@/components/ui/SearchBar';

export default function StoreCategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const { data: categoriesData } = useStoreCategories(storeId);
  const createCategory = useCreateStoreCategory();
  const updateCategory = useUpdateStoreCategory();
  const deleteCategory = useDeleteStoreCategory();
  const importMasterCategories = useImportMasterCategories();

  const categories = categoriesData || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string>('');
  const [editingName, setEditingName] = useState('');

  const handleImportMaster = () => {
    importMasterCategories.mutate(
      { storeId },
      {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Master categories imported successfully!');
          setIsImportModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to import master categories');
        },
      }
    );
  };

  const parentCategoryOptions = useMemo(() => {
    return [
      { value: '', label: 'None (Root Category)' },
      ...categories.filter((c: any) => !c.parentId).map((c: any) => ({ value: c.id, label: c.name }))
    ];
  }, [categories]);

  // 1. Filtered categories list
  const categoriesWithLiveCounts = useMemo(() => {
    return categories
      .map((cat: any) => ({
        ...cat,
        productCount: cat._count?.products || 0,
      }))
      .filter((cat: any) =>
        searchQuery ? cat.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  }, [categories, searchQuery]);

  // 2. Submit new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name cannot be empty!');
      return;
    }

    createCategory.mutate(
      { storeId, payload: { name: newCatName.trim() } },
      {
        onSuccess: () => {
          toast.success(`Category "${newCatName}" created!`);
          setNewCatName('');
          setParentId('');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create category');
        },
      }
    );
  };

  // 3. Edit category name inline
  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) {
      toast.error('Category name cannot be empty!');
      return;
    }

    updateCategory.mutate(
      { id, storeId, payload: { name: editingName.trim() } },
      {
        onSuccess: () => {
          toast.success('Category name updated!');
          setEditingId('');
          setEditingName('');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update category');
        },
      }
    );
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleDeleteCategory = (id: string, name: string, count: number) => {
    if (count > 0) {
      toast.error(`Cannot delete category "${name}" because it contains ${count} active products.`);
      return;
    }
    deleteCategory.mutate(
      { id, storeId },
      {
        onSuccess: () => {
          toast.success(`Category "${name}" deleted`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to delete category');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader
        icon={Layers}
        title="Product Categories"
        subtitle="Manage product category trees, groups, and catalog tax defaults"
      />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
          
          {/* Left Column: Categories List */}
          <Card className="min-h-[500px]">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary-500" />
                  Active Categories ({categoriesWithLiveCounts.length})
                </CardTitle>
                <CardDescription>Hierarchical list of catalog categories and current product counts</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  <Download className="h-4 w-4 text-emerald-500" />
                  Import Master Categories
                </Button>
                <div className="w-full sm:w-64">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search categories..."
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {categoriesWithLiveCounts.map((cat: any) => {
                  const parentName = categories.find((c: any) => c.id === cat.parentId)?.name;
                  const isEditing = editingId === cat.id;
                  
                  return (
                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="min-w-0 pr-4 space-y-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              size={20}
                              value={editingName} 
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-9 w-48 font-bold"
                            />
                            <Button size="sm" onClick={() => handleSaveEdit(cat.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId('')}>Cancel</Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</span>
                              {parentName && (
                                <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground">
                                  Sub of: {parentName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground">
                              ID: {cat.id}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <Badge variant={cat.productCount > 0 ? 'success' : 'outline'} className="font-extrabold text-[10px]">
                          {cat.productCount} products
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleStartEdit(cat.id, cat.name)}
                            >
                              <Edit3 className="h-4 w-4 text-primary-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                            onClick={() => handleDeleteCategory(cat.id, cat.name, cat.productCount)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Add Category Form */}
          <Card>
            <CardHeader className="pb-4 bg-muted/20 border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary-500" />
                Add Category
              </CardTitle>
              <CardDescription>Create a new category in your store catalog</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Category Name *</label>
                  <Input
                    placeholder="e.g. Atta & Flour"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    icon={<Tag className="h-4 w-4" />}
                  />
                </div>

                <div className="space-y-1 z-20">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Parent Category (Optional)</label>
                  <CustomDropdown
                    options={parentCategoryOptions}
                    value={parentId}
                    onChange={setParentId}
                    triggerClassName="h-[38px] !text-xs font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Allows creating simple nested hierarchies (e.g. Dairy &rarr; Cheese)</p>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>
                    New categories are instantly ready in the Product Form dropdown. Deletion is restricted if products are tied to it.
                  </span>
                </div>

                <Button type="submit" className="w-full h-11 flex items-center justify-center gap-2" variant="brand">
                  <Plus className="h-4 w-4" /> Create Category
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* IMPORT MASTER CATEGORIES CONFIRM MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-background border-border shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-500" />
                Import Master Categories
              </CardTitle>
              <CardDescription className="text-xs">
                Copy all master categories from the admin catalog into your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to import all master categories into your store? Missing categories will be copied automatically without overwriting existing ones.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="brand" 
                  size="sm" 
                  onClick={handleImportMaster}
                  disabled={importMasterCategories.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {importMasterCategories.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Confirm & Import Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
