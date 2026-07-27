import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, FolderTree, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useMasterCatalog } from '../api/useMasterCatalog';
import type { MasterCategory } from '../schemas/catalogSchemas';

export function CategoryManagementPage() {
  const { categories, flatCategories, isLoadingCategories, createCategory, uploadImage } = useMasterCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Check console.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({
      name,
      parentId: parentId || null,
      imageUrl,
      sortOrder: 0
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setName('');
        setParentId('');
        setImageUrl('');
      }
    });
  };

  const renderTree = (nodes: MasterCategory[], level = 0) => {
    if (!nodes || nodes.length === 0) return null;
    
    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-6 pl-4 border-l border-slate-200 dark:border-white/10' : ''}`}>
        {nodes.map(node => (
          <div key={node.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {node.imageUrl ? (
                  <img src={node.imageUrl} alt={node.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderTree className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="font-medium text-slate-800 dark:text-slate-200">{node.name}</div>
            </div>
            {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (isLoadingCategories) {
    return <div className="p-8 text-center text-slate-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Categories"
        subtitle="Manage the global category tree for the platform."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        }
      />

      <div className="p-6">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              No categories found. Create a root category to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl">
            {renderTree(categories)}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Category" maxWidth="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category Name *</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dairy & Bakery" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent Category</label>
            <select 
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">None (Root Category)</option>
              {flatCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category Image</label>
            {imageUrl ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
              </div>
            ) : (
              <div className="relative">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="pl-10" />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {isUploading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin absolute right-3 top-3" />}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createCategory.isPending} disabled={isUploading}>Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CategoryManagementPage;
