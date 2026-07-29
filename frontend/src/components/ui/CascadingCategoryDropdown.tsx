import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface CategoryItem {
  id: string;
  name: string;
  parentId?: string | null;
  [key: string]: any;
}

interface TreeNode extends CategoryItem {
  children: TreeNode[];
}

export interface CascadingCategoryDropdownProps {
  categories: CategoryItem[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function CascadingCategoryDropdown({
  categories = [],
  value,
  onChange,
  placeholder = "Select Category",
  disabled = false,
  className,
  triggerClassName
}: CascadingCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build Tree
  const { tree, flatMap } = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize map
    categories.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });

    // Build tree
    categories.forEach(c => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return { tree: roots, flatMap: map };
  }, [categories]);

  // Selected label logic
  const selectedNode = value ? flatMap.get(value) : null;
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.cascading-dropdown-portal')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Tree for search (flattens if searching, otherwise uses tree)
  const isSearching = searchTerm.trim().length > 0;
  const filteredFlatList = useMemo(() => {
    if (!isSearching) return [];
    return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm, isSearching]);

  return (
    <div className={cn("relative w-full z-40 select-none text-[13px]", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-[38px] w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 font-medium text-slate-700 dark:text-zinc-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer text-left",
          triggerClassName
        )}
      >
        <span className="truncate">
          {selectedNode ? selectedNode.name : <span className="text-slate-400 font-normal">{placeholder}</span>}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-visible z-[100] animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 dark:border-zinc-800/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-md bg-slate-50 dark:bg-zinc-800/50 text-xs border-none focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar relative">
            {isSearching ? (
              filteredFlatList.length > 0 ? (
                filteredFlatList.map(cat => (
                  <div
                    key={cat.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors",
                      value === cat.id && "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold"
                    )}
                    onClick={() => { onChange(cat.id); setIsOpen(false); setSearchTerm(''); }}
                  >
                    {cat.name}
                    {value === cat.id && <Check className="w-4 h-4" />}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-500">No categories found.</div>
              )
            ) : (
              tree.length > 0 ? (
                tree.map(node => (
                  <MenuNode 
                    key={node.id} 
                    node={node} 
                    selectedValue={value} 
                    onSelect={(id) => { onChange(id); setIsOpen(false); }} 
                  />
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-500">No categories available.</div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Recursive Node Component
function MenuNode({ node, selectedValue, onSelect }: { node: TreeNode; selectedValue: string; onSelect: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, isLeftMode: false });
  const hasChildren = node.children && node.children.length > 0;
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const SUBMENU_WIDTH = 200; // matches w-[200px]
      const SPACE_RIGHT = window.innerWidth - rect.right;
      
      let left = rect.right;
      let isLeftMode = false;
      
      if (SPACE_RIGHT < SUBMENU_WIDTH + 20) {
        // Not enough space on right, open to left
        left = rect.left - SUBMENU_WIDTH;
        isLeftMode = true;
      }

      setCoords({ top: rect.top, left, isLeftMode });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  return (
    <div 
      ref={nodeRef}
      className="relative group/node"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
          isHovered ? "bg-slate-100 dark:bg-zinc-800/80" : "",
          selectedValue === node.id && "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        <span className="truncate">{node.name}</span>
        {hasChildren ? (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        ) : (
          selectedValue === node.id && <Check className="w-4 h-4" />
        )}
      </div>

      {/* Submenu via Portal */}
      {hasChildren && isHovered && createPortal(
        <div 
          className={cn("cascading-dropdown-portal fixed z-[1000] text-[13px]", coords.isLeftMode ? "pr-1" : "pl-1")}
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={cn(
              "w-[200px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl animate-in fade-in duration-150 p-1",
              coords.isLeftMode ? "slide-in-from-right-2" : "slide-in-from-left-2"
            )}
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {node.children.map(child => (
                <MenuNode 
                  key={child.id} 
                  node={child} 
                  selectedValue={selectedValue} 
                  onSelect={onSelect} 
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
