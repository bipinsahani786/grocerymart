import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id?: string;
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 220 });

  // Build Tree
  const { tree, flatMap } = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize map
    categories.forEach(c => {
      const id = c.id || '';
      if (id) {
        map.set(id, { ...c, id, children: [] });
      }
    });

    // Build tree
    categories.forEach(c => {
      const id = c.id || '';
      if (!id) return;
      const node = map.get(id);
      if (node) {
        if (c.parentId && map.has(c.parentId)) {
          map.get(c.parentId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return { tree: roots, flatMap: map };
  }, [categories]);

  // Selected label logic
  const selectedNode = value ? flatMap.get(value) : null;

  // Compute trigger button coords for portal positioning
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(220, rect.width),
      });
    }
    setIsOpen(!isOpen);
  };

  // Filtered list when searching
  const isSearching = searchTerm.trim().length > 0;
  const filteredFlatList = useMemo(() => {
    if (!isSearching) return [];
    return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm, isSearching]);

  return (
    <div className={cn("relative w-full text-[13px]", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
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

      {/* PORTAL DROPDOWN MENU FOR DESKTOP AND MOBILE */}
      {isOpen && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile Bottom Sheet / Modal View (Phone Screens) */}
          <div className="fixed inset-x-0 bottom-0 z-[9999] sm:hidden bg-white dark:bg-zinc-900 rounded-t-2xl border-t border-slate-200 dark:border-zinc-800 p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-extrabold text-sm text-foreground">Select Category</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs border-none focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {isSearching ? (
                filteredFlatList.length > 0 ? (
                  filteredFlatList.map((cat) => (
                    <div
                      key={cat.id}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer",
                        value === cat.id ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-zinc-800"
                      )}
                      onClick={() => {
                        onChange(cat.id || '');
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <span>{cat.name}</span>
                      {value === cat.id && <Check className="w-4 h-4 text-primary-600" />}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">No categories found.</div>
                )
              ) : (
                tree.map((node) => (
                  <MobileTreeNode
                    key={node.id}
                    node={node}
                    selectedValue={value}
                    onSelect={(id) => {
                      onChange(id);
                      setIsOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Desktop Portal View */}
          <div
            className="cascading-dropdown-portal fixed z-[9999] hidden sm:block animate-in fade-in duration-100"
            style={{
              top: coords.top + 4,
              left: coords.left,
              width: coords.width,
            }}
          >
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden p-1 space-y-1">
              <div className="p-1.5 border-b border-slate-100 dark:border-zinc-800/50">
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

              <div className="max-h-[320px] overflow-y-auto p-1 custom-scrollbar">
                {isSearching ? (
                  filteredFlatList.length > 0 ? (
                    filteredFlatList.map((cat) => (
                      <div
                        key={cat.id}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors",
                          value === cat.id && "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold"
                        )}
                        onClick={() => {
                          onChange(cat.id || '');
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        {cat.name}
                        {value === cat.id && <Check className="w-4 h-4" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-slate-500">No categories found.</div>
                  )
                ) : (
                  tree.map((node) => (
                    <MenuNode
                      key={node.id}
                      node={node}
                      selectedValue={value}
                      onSelect={(id) => {
                        onChange(id);
                        setIsOpen(false);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// Mobile Accordion Tree Node Component
function MobileTreeNode({ node, selectedValue, onSelect }: { node: TreeNode; selectedValue: string; onSelect: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors",
          selectedValue === node.id ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-zinc-800"
        )}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          } else {
            onSelect(node.id || '');
          }
        }}
      >
        <span className="truncate">{node.name}</span>
        {hasChildren ? (
          <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
        ) : (
          selectedValue === node.id && <Check className="w-4 h-4 text-primary-600" />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-4 space-y-1 border-l-2 border-primary-500/20 ml-2">
          <div
            className="p-2 rounded-md text-xs font-bold text-primary-600 cursor-pointer hover:bg-primary-50"
            onClick={() => onSelect(node.id || '')}
          >
            All "{node.name}"
          </div>
          {node.children.map((child) => (
            <MobileTreeNode
              key={child.id}
              node={child}
              selectedValue={selectedValue}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Desktop Menu Node Component
function MenuNode({ node, selectedValue, onSelect }: { node: TreeNode; selectedValue: string; onSelect: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, isLeftMode: false });
  const hasChildren = node.children && node.children.length > 0;
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const SUBMENU_WIDTH = 200;
      const SPACE_RIGHT = window.innerWidth - rect.right;

      let left = rect.right;
      let isLeftMode = false;

      if (SPACE_RIGHT < SUBMENU_WIDTH + 20) {
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
          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors select-none",
          isHovered ? "bg-slate-100 dark:bg-zinc-800/80" : "",
          selectedValue === node.id && "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id || '');
        }}
      >
        <span className="truncate">{node.name}</span>
        {hasChildren ? (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        ) : (
          selectedValue === node.id && <Check className="w-4 h-4" />
        )}
      </div>

      {hasChildren && isHovered && createPortal(
        <div
          className={cn("cascading-dropdown-portal fixed z-[10000] text-[13px]", coords.isLeftMode ? "pr-1" : "pl-1")}
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              "w-[200px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl animate-in fade-in duration-150 p-1",
              coords.isLeftMode ? "slide-in-from-right-2" : "slide-in-from-left-2"
            )}
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <div
                className="flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 border-b border-border/40 mb-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(node.id || '');
                }}
              >
                <span>All "{node.name}"</span>
                {selectedValue === node.id && <Check className="w-3.5 h-3.5" />}
              </div>
              {node.children.map((child) => (
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
