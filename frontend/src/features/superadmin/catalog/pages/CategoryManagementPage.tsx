import React, { useState, useMemo } from 'react';
import {
  Plus,
  FolderTree,
  Loader2,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderPlus,
  Grid,
  ListTree,
  X,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterCategory } from '../schemas/catalogSchemas';

/* ── Enterprise Styled KPI Card (Matches Store Dashboard & Managers Page) ── */
function CustomKpiCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'bg-primary-500',
  iconColorClass = 'text-white bg-white/20',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass?: string;
  iconColorClass?: string;
}) {
  return (
    <div className={`transition-all duration-300 relative overflow-hidden rounded-xl shadow-sm hover:shadow-md border border-white/10 p-3.5 sm:p-4 flex flex-col justify-between min-h-[90px] w-full text-white group ${colorClass}`}>
      {/* Decorative Background Shapes */}
      <div className="absolute right-2 top-2 w-16 h-16 bg-white/20 rotate-45 rounded-xl mix-blend-overlay pointer-events-none group-hover:bg-white/30 transition-all duration-500" />
      <div className="absolute -left-4 bottom-0 w-20 h-20 bg-black/10 rounded-full mix-blend-overlay pointer-events-none group-hover:bg-black/20 transition-all duration-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[2px] border-white/10 rounded-none mix-blend-overlay opacity-30 pointer-events-none rotate-12 scale-150" />

      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80 select-none truncate block">
              {title}
            </span>
            <div className="flex items-baseline min-w-0 mt-0.5">
              <span className="text-lg sm:text-2xl font-black tracking-tight font-display truncate block w-full text-white drop-shadow-sm" title={value.toString()}>
                {value}
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 transition-colors backdrop-blur-sm shadow-sm ${iconColorClass}`}>
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 sm:w-5 sm:h-5' })
              : icon}
          </div>
        </div>

        {subtitle && (
          <div className="mt-auto min-w-0 pt-1.5 border-t border-white/20">
            <span className="text-[8px] sm:text-[9.5px] font-semibold text-white/80 block truncate" title={subtitle}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoryManagementPage() {
  const { categories, flatCategories, isLoadingCategories, createCategory, uploadImage } = useMasterCatalog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Calculate Metrics
  const stats = useMemo(() => {
    const total = flatCategories.length;
    const rootCount = categories.length;
    const subCount = total - rootCount;
    return { total, rootCount, subCount };
  }, [flatCategories, categories]);

  // Open Modal for Root Category (No Parent Dropdown)
  const handleOpenRootModal = () => {
    setIsSubcategoryMode(false);
    setParentId('');
    setName('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  // Open Modal for Subcategory (Pre-fills and shows Parent Selection)
  const handleOpenSubcategoryModal = (parentCategoryId: string) => {
    setIsSubcategoryMode(true);
    setParentId(parentCategoryId);
    setName('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  // Toggle single node expansion
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand or Collapse All
  const handleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    flatCategories.forEach((c) => {
      if (c.id) newExpanded[c.id] = true;
    });
    setExpandedNodes(newExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setImageUrl(url);
      toast.success('Category image uploaded successfully');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload category image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    createCategory.mutate(
      {
        name,
        parentId: isSubcategoryMode ? (parentId || null) : null,
        imageUrl,
        sortOrder: 0,
      },
      {
        onSuccess: () => {
          toast.success(`Category "${name}" created successfully!`);
          setIsModalOpen(false);
          setName('');
          setParentId('');
          setImageUrl('');
        },
        onError: () => {
          toast.error('Failed to create category. Please try again.');
        },
      }
    );
  };

  // Filter Categories by Search Query
  const filteredFlatCategories = useMemo(() => {
    if (!searchQuery.trim()) return flatCategories;
    const q = searchQuery.toLowerCase();
    return flatCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [flatCategories, searchQuery]);

  // Recursive Tree Rendering
  const renderTreeNodes = (nodes: MasterCategory[], level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <div className={`space-y-2.5 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800' : ''}`}>
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const searchMatches = searchQuery.trim() !== '' && node.name.toLowerCase().includes(searchQuery.toLowerCase());
          const isExpanded = searchMatches || expandedNodes[node.id!] !== false;

          // Hide node if searching and doesn't match and no matching children
          if (searchQuery.trim() !== '') {
            const hasMatchingDescendant = (item: MasterCategory): boolean => {
              if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
              return item.children?.some(hasMatchingDescendant) || false;
            };
            if (!hasMatchingDescendant(node)) return null;
          }

          return (
            <div key={node.id} className="space-y-2">
              {/* Category Node Row Card */}
              <div className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-primary-500/40 transition-all duration-200">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Expand / Collapse Chevron Toggle */}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(node.id!)}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-primary-500" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                  )}

                  {/* Thumbnail Image / Fallback */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {node.imageUrl ? (
                      <img src={node.imageUrl} alt={node.name} className="w-full h-full object-cover" />
                    ) : (
                      <FolderTree className="w-5 h-5 text-primary-500/70" />
                    )}
                  </div>

                  {/* Name & Hierarchy Label */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {node.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {level === 0 ? 'Root' : `Level ${level + 1}`}
                      </span>
                    </div>

                    {hasChildren && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                        {node.children!.length} subcategor{node.children!.length === 1 ? 'y' : 'ies'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Node Action Buttons */}
                <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
                    onClick={() => handleOpenSubcategoryModal(node.id!)}
                  >
                    <FolderPlus className="w-3.5 h-3.5 mr-1" />
                    Add Subcategory
                  </Button>
                </div>
              </div>

              {/* Nested Children Trees */}
              {hasChildren && isExpanded && renderTreeNodes(node.children!, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── KPI Summary Cards (Identical Layout to Store Dashboard) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <CustomKpiCard
            title="Total Categories"
            value={stats.total}
            subtitle={`${stats.rootCount} Root • ${stats.subCount} Subcategories`}
            icon={<Layers />}
            colorClass="bg-gradient-to-br from-primary-600 to-indigo-800"
          />
          <CustomKpiCard
            title="Root Categories"
            value={stats.rootCount}
            subtitle="Top Level Main Taxonomies"
            icon={<FolderTree />}
            colorClass="bg-gradient-to-br from-emerald-600 to-teal-800"
          />
          <CustomKpiCard
            title="Subcategories"
            value={stats.subCount}
            subtitle="Nested Catalog Branches"
            icon={<FolderPlus />}
            colorClass="bg-gradient-to-br from-amber-600 to-orange-800"
          />
          <CustomKpiCard
            title="Catalog Coverage"
            value="100%"
            subtitle="Global Master Taxonomy"
            icon={<Sparkles />}
            colorClass="bg-gradient-to-br from-violet-600 to-purple-800"
          />
        </div>

        {/* ── Search, Action Button, View Switcher & Tree Controls Bar ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name..."
              className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons & View Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
            
            <Button
              type="button"
              onClick={handleOpenRootModal}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-3.5 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Root Category
            </Button>

            {viewMode === 'tree' && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  className="h-8 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  Expand All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="h-8 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  Collapse All
                </Button>
              </div>
            )}

            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Tree Hierarchy View"
              >
                <ListTree className="w-3.5 h-3.5" />
                Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Category Display Area ── */}
        {isLoadingCategories ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading catalog category tree...</p>
          </div>
        ) : flatCategories.length === 0 ? (
          <Card className="border border-dashed border-slate-300 dark:border-slate-800">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-500 mx-auto flex items-center justify-center">
                <FolderTree className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Categories Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Get started by creating root categories (e.g. Dairy & Bakery, Fresh Produce, Beverages) for your store catalog.
                </p>
              </div>
              <Button
                onClick={handleOpenRootModal}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-4 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'tree' ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Category Taxonomy Hierarchy
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Showing {categories.length} Root Trees
              </span>
            </div>
            {renderTreeNodes(categories)}
          </div>
        ) : (
          /* Grid Mode View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFlatCategories.map((c) => {
              const parentCategory = flatCategories.find((p) => p.id === c.parentId);
              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary-500/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <FolderTree className="w-6 h-6 text-primary-500/70" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                        {c.parentId ? 'Subcategory' : 'Root'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {c.name}
                      </h4>
                      {parentCategory ? (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          Parent: <span className="font-semibold text-slate-700 dark:text-slate-300">{parentCategory.name}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Top Level Category
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
                      onClick={() => handleOpenSubcategoryModal(c.id!)}
                    >
                      <FolderPlus className="w-3.5 h-3.5 mr-1" />
                      Add Child Subcategory
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Create / Add Category Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isSubcategoryMode ? 'Add Subcategory' : 'Create Root Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isSubcategoryMode ? 'e.g. Organic Milk' : 'e.g. Dairy & Bakery'}
            />
          </div>

          {/* Show Parent Category selection ONLY when creating a subcategory */}
          {isSubcategoryMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Parent Category Level <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="" disabled>Select Parent Category</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category Thumbnail Image
            </label>
            {imageUrl ? (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm">
                <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-xs shadow-md transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="pl-10 text-xs"
                />
                <UploadCloud className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                {isUploading && (
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin absolute right-3 top-3" />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createCategory.isPending}
              disabled={isUploading}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 cursor-pointer"
            >
              {isSubcategoryMode ? 'Save Subcategory' : 'Save Root Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CategoryManagementPage;
