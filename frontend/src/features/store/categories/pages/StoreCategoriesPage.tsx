import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  FolderTree, 
  Tag, 
  FolderPlus,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockStore } from '@/store/mockStore';
import { toast } from 'sonner';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { SearchBar } from '@/components/ui/SearchBar';

export default function StoreCategoriesPage() {
  const { categories, addCategory, deleteCategory, editCategory, products } = useMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string>('');
  const [editingName, setEditingName] = useState('');

  const parentCategoryOptions = useMemo(() => {
    return [
      { value: '', label: 'None (Root Category)' },
      ...categories.filter(c => c.parentId === null).map(c => ({ value: c.id, label: c.name }))
    ];
  }, [categories]);

  // 1. Calculate active product counts per category dynamically from current products list
  const categoriesWithLiveCounts = useMemo(() => {
    return categories
      .map(cat => {
        const liveCount = products.filter(p => p.categoryId === cat.id).length;
        return {
          ...cat,
          productCount: liveCount
        };
      })
      .filter(cat =>
        searchQuery ? cat.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  }, [categories, products, searchQuery]);

  // 2. Submit new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name cannot be empty!');
      return;
    }

    addCategory({
      name: newCatName.trim(),
      parentId: parentId || null
    });

    toast.success(`Category "${newCatName}" created!`);
    setNewCatName('');
    setParentId('');
  };

  // 3. Edit category name inline
  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) {
      toast.error('Category name cannot be empty!');
      return;
    }
    editCategory(id, editingName.trim());
    toast.success('Category name updated!');
    setEditingId('');
    setEditingName('');
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  // 4. Delete category
  const handleDeleteCategory = (id: string, name: string, count: number) => {
    if (count > 0) {
      toast.error(`Cannot delete "${name}" because it contains ${count} products! Please reassign products first.`);
      return;
    }
    
    deleteCategory(id);
    toast.success(`Category "${name}" deleted successfully.`);
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
              <div className="w-full sm:w-64">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search categories..."
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {categoriesWithLiveCounts.map((cat) => {
                  const parentName = categories.find(c => c.id === cat.parentId)?.name;
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
    </div>
  );
}
