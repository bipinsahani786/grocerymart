import React, { useState, useMemo, type FormEvent } from 'react';
import { Loader2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterCategory } from '../schemas/catalogSchemas';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';

import { CategoryKpiSummary } from '../components/CategoryKpiSummary';
import { CategoryControlBar } from '../components/CategoryControlBar';
import { CategoryTreeNode } from '../components/CategoryTreeNode';
import { CategoryGridCard } from '../components/CategoryGridCard';
import { CategoryFormModal } from '../components/CategoryFormModal';

export function CategoryManagementPage() {
  const {
    categories,
    flatCategories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
  } = useMasterCatalog();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Deletion Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<MasterCategory | null>(null);

  // Search & View Mode State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Metrics Calculation
  const stats = useMemo(() => {
    const total = flatCategories.length;
    const rootCount = categories.length;
    const subCount = total - rootCount;
    return { total, rootCount, subCount };
  }, [flatCategories, categories]);

  // Modal Handlers
  const handleOpenRootModal = () => {
    setEditingCategory(null);
    setIsSubcategoryMode(false);
    setName('');
    setParentId('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenSubcategoryModal = (parentCatId: string) => {
    setEditingCategory(null);
    setIsSubcategoryMode(true);
    setName('');
    setParentId(parentCatId);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: MasterCategory) => {
    setEditingCategory(category);
    setIsSubcategoryMode(Boolean(category.parentId));
    setName(category.name);
    setParentId(category.parentId || '');
    setImageUrl(category.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
    setParentId('');
    setImageUrl('');
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage.mutateAsync(file);
      setImageUrl(url);
      toast.success('Category image uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Form Submit Handler (Create & Update)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id!,
          payload: {
            name: name.trim(),
            parentId: parentId || null,
            imageUrl: imageUrl || null,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Category "${name}" updated successfully`);
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update category');
          },
        }
      );
    } else {
      createCategory.mutate(
        {
          name: name.trim(),
          parentId: parentId || null,
          imageUrl: imageUrl || null,
          sortOrder: 0,
        },
        {
          onSuccess: () => {
            toast.success(`Category "${name}" created successfully`);
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create category');
          },
        }
      );
    }
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!categoryToDelete?.id) return;

    deleteCategory.mutate(categoryToDelete.id, {
      onSuccess: () => {
        toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
        setCategoryToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete category');
      },
    });
  };

  // Tree Expand / Collapse Toggles
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    flatCategories.forEach((c) => {
      if (c.id) allExpanded[c.id] = true;
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    flatCategories.forEach((c) => {
      if (c.id) allCollapsed[c.id] = false;
    });
    setExpandedNodes(allCollapsed);
  };

  // Filtered Flat Categories for Search
  const filteredFlatCategories = useMemo(() => {
    if (!searchQuery.trim()) return flatCategories;
    return flatCategories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flatCategories, searchQuery]);

  // Recursive Tree Rendering Helper
  const renderTreeNodes = (nodes: MasterCategory[], level: number = 0): React.ReactNode => {
    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4 sm:ml-6 pl-2 sm:pl-3 border-l-2 border-slate-200 dark:border-slate-800' : ''}`}>
        {nodes.map((node) => (
          <CategoryTreeNode
            key={node.id}
            node={node}
            level={level}
            searchQuery={searchQuery}
            expandedNodes={expandedNodes}
            toggleExpand={toggleExpand}
            onAddSubcategory={handleOpenSubcategoryModal}
            onEditCategory={handleOpenEditModal}
            onDeleteCategory={(cat) => setCategoryToDelete(cat)}
            renderChildren={renderTreeNodes}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── KPI Summary Cards ── */}
        <CategoryKpiSummary stats={stats} />

        {/* ── Control Bar (Search, View Mode, Action Buttons) ── */}
        <CategoryControlBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleExpandAll={handleExpandAll}
          handleCollapseAll={handleCollapseAll}
          handleOpenRootModal={handleOpenRootModal}
        />

        {/* ── Main Category Display Area ── */}
        {isLoadingCategories ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-xs font-semibold text-slate-500">Loading catalog taxonomy...</p>
          </div>
        ) : flatCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm mb-3">
              <FolderTree className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No Categories Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Start building your product taxonomy hierarchy by adding your first root category.
            </p>
          </div>
        ) : filteredFlatCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm mb-3">
              <FolderTree className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No categories found matching your filters.</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Try searching with a different category keyword or reset your filter.
            </p>
          </div>
        ) : viewMode === 'tree' ? (
          /* Tree Mode View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
            {renderTreeNodes(categories)}
          </div>
        ) : (
          /* Grid Mode View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFlatCategories.map((c) => {
              const parentCategory = flatCategories.find((p) => p.id === c.parentId);
              return (
                <CategoryGridCard
                  key={c.id}
                  category={c}
                  parentCategory={parentCategory}
                  onAddSubcategory={handleOpenSubcategoryModal}
                  onEditCategory={handleOpenEditModal}
                  onDeleteCategory={(cat) => setCategoryToDelete(cat)}
                />
              );
            })}
          </div>
        )}

      </div>

      {/* ── Create / Edit Category Modal ── */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingCategory={editingCategory}
        isSubcategoryMode={isSubcategoryMode}
        name={name}
        setName={setName}
        parentId={parentId}
        setParentId={setParentId}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        isUploading={isUploading}
        handleImageUpload={handleImageUpload}
        handleSubmit={handleSubmit}
        flatCategories={flatCategories}
        isPending={createCategory.isPending || updateCategory.isPending}
      />

      {/* ── Delete Confirmation Modal ── */}
      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        itemName={categoryToDelete?.name}
      />
    </div>
  );
}

export default CategoryManagementPage;
