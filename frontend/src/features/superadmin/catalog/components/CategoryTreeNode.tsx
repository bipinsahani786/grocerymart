import React from 'react';
import { ChevronDown, ChevronRight, FolderPlus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import type { MasterCategory } from '../schemas/catalogSchemas';

interface CategoryTreeNodeProps {
  node: MasterCategory;
  level?: number;
  searchQuery: string;
  expandedNodes: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  onAddSubcategory: (parentId: string) => void;
  onEditCategory: (category: MasterCategory) => void;
  onDeleteCategory: (category: MasterCategory) => void;
  renderChildren?: (children: MasterCategory[], level: number) => React.ReactNode;
}

export function CategoryTreeNode({
  node,
  level = 0,
  searchQuery,
  expandedNodes,
  toggleExpand,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  renderChildren,
}: CategoryTreeNodeProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);

  // Search filtering matching logic
  const searchMatches =
    searchQuery.trim() !== '' && node.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isExpanded = searchMatches || expandedNodes[node.id!] !== false;

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
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary-500" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
          )}

          {/* Thumbnail Image / Fallback */}
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <SafeCategoryImage src={node.imageUrl} alt={node.name} className="w-full h-full object-cover" iconSize="w-5 h-5" />
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
            onClick={() => onAddSubcategory(node.id!)}
          >
            <FolderPlus className="w-3.5 h-3.5 mr-1" />
            Add Subcategory
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Edit Category"
            onClick={() => onEditCategory(node)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Delete Category"
            onClick={() => onDeleteCategory(node)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Nested Children Trees */}
      {hasChildren && isExpanded && renderChildren && renderChildren(node.children!, level + 1)}
    </div>
  );
}

export default CategoryTreeNode;
