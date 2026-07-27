import { FolderPlus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import type { MasterCategory } from '../schemas/catalogSchemas';

interface CategoryGridCardProps {
  category: MasterCategory;
  parentCategory?: MasterCategory;
  onAddSubcategory: (parentId: string) => void;
  onEditCategory: (category: MasterCategory) => void;
  onDeleteCategory: (category: MasterCategory) => void;
}

export function CategoryGridCard({
  category,
  parentCategory,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryGridCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary-500/40 transition-all space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <SafeCategoryImage src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" iconSize="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
              {category.parentId ? 'Subcategory' : 'Root'}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Edit Category"
              onClick={() => onEditCategory(category)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Delete Category"
              onClick={() => onDeleteCategory(category)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
            {category.name}
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
          onClick={() => onAddSubcategory(category.id!)}
        >
          <FolderPlus className="w-3.5 h-3.5 mr-1" />
          Add Child Subcategory
        </Button>
      </div>
    </div>
  );
}

export default CategoryGridCard;
