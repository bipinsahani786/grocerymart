import { ListTree, Grid, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/SearchBar';
import { cn } from '@/lib/utils';

interface CategoryControlBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'tree' | 'grid';
  setViewMode: (mode: 'tree' | 'grid') => void;
  handleExpandAll: () => void;
  handleCollapseAll: () => void;
  handleOpenRootModal: () => void;
  isAllExpanded?: boolean;
  isAllCollapsed?: boolean;
}

export function CategoryControlBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleExpandAll,
  handleCollapseAll,
  handleOpenRootModal,
  isAllExpanded = false,
  isAllCollapsed = false,
}: CategoryControlBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="w-full sm:w-80">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories by name..."
        />
      </div>

      {/* Action Buttons & View Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
        {viewMode === 'tree' && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isAllExpanded ? "default" : "outline"}
              size="sm"
              onClick={handleExpandAll}
              className={cn(
                "h-8 text-[11px] font-semibold transition-all cursor-pointer",
                isAllExpanded
                  ? "bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              Expand All
            </Button>
            <Button
              type="button"
              variant={isAllCollapsed ? "default" : "outline"}
              size="sm"
              onClick={handleCollapseAll}
              className={cn(
                "h-8 text-[11px] font-semibold transition-all cursor-pointer",
                isAllCollapsed
                  ? "bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
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

        {/* Add Root Category Button at Right Corner */}
        <Button
          type="button"
          onClick={handleOpenRootModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-3.5 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto sm:ml-0"
        >
          <Plus className="w-4 h-4" />
          Add Root Category
        </Button>
      </div>
    </div>
  );
}

export default CategoryControlBar;
