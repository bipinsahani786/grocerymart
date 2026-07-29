import React, { type FormEvent } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import { CascadingCategoryDropdown } from '@/components/ui/CascadingCategoryDropdown';

interface StoreCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: any | null;
  isSubcategoryMode: boolean;
  name: string;
  setName: (val: string) => void;
  parentId: string;
  setParentId: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  isUploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  flatCategories: any[];
  isPending: boolean;
}

export function StoreCategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  isSubcategoryMode,
  name,
  setName,
  parentId,
  setParentId,
  imageUrl,
  setImageUrl,
  isUploading,
  handleImageUpload,
  handleSubmit,
  flatCategories,
  isPending,
}: StoreCategoryFormModalProps) {
  const isEditing = Boolean(editingCategory);

  const getModalTitle = () => {
    if (isEditing) return `Edit Category: ${editingCategory?.name}`;
    if (isSubcategoryMode) return 'Add Subcategory';
    return 'Create Root Category';
  };

  // We filter out the editing category itself so it cannot be its own parent
  const filteredFlatCategories = flatCategories.filter(c => c.id !== editingCategory?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      maxWidth="sm"
      overflowVisible={true}
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

        {/* Show Parent Category selection ONLY when creating/editing a subcategory or if parentId exists */}
        {(isSubcategoryMode || Boolean(parentId)) && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Parent Category <span className="text-rose-500">*</span>
            </label>
            <CascadingCategoryDropdown
              categories={filteredFlatCategories}
              value={parentId}
              onChange={(val) => setParentId(val)}
              placeholder="-- Select Parent Category --"
            />
          </div>
        )}

        {/* Upload Image Area with Border Separator Container */}
        <div className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Category Image
          </label>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                <SafeCategoryImage src={imageUrl} alt="Category preview" type="category" className="w-full h-full object-cover" iconSize="w-6 h-6" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md transition-colors cursor-pointer"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex-1 flex flex-col items-center justify-center py-4 px-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-primary-500/60 bg-white dark:bg-slate-900 cursor-pointer transition-colors">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Click to upload category image
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP formats supported
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || isUploading} className="bg-primary-600 hover:bg-primary-700 text-white cursor-pointer">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default StoreCategoryFormModal;
