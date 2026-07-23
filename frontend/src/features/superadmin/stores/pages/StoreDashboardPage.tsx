import { useState, useMemo, useEffect } from 'react';
import { Building2, Plus, Store as StoreIcon, User, Power, Edit, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { FilterContainer, FilterSearch, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { useStores, useUpdateStoreStatus, usePrefetchStore } from '../api/useStores';
import type { Store } from '../types';
import { STORE_STATUS_OPTIONS, STORE_MODULE_OPTIONS } from '@/constants/options';

const EmptyStoreIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600 mb-2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M6 13h.01" />
    <path d="M6 17h.01" />
    <path d="M18 13h.01" />
    <path d="M18 17h.01" />
  </svg>
);

export default function StoreDashboardPage() {
  const navigate = useNavigate();
  const prefetchStore = usePrefetchStore();

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [module, setModule] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, module]);

  const { data: response, isLoading } = useStores({
    search,
    status: status || 'all',
    module: module || 'all',
    page,
    limit,
  });

  const updateStatus = useUpdateStoreStatus();

  const handleToggleStatus = (store: Store) => {
    updateStatus.mutate({ id: store.id, isActive: !store.isActive });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setModule('');
    setPage(1);
  };

  const stores = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const activeCount = stores.filter(s => s.isActive).length;
  const inactiveCount = stores.filter(s => !s.isActive).length;
  const totalStaffCount = stores.reduce((acc, curr) => acc + (curr._count?.users || 0), 0);

  const columns: ColumnDef<Store>[] = useMemo(() => [
    {
      header: 'Franchise Store',
      accessorKey: 'name',
      cell: (store) => (
        <div className="flex items-center gap-2 py-0.5">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-[13px] text-slate-900 dark:text-slate-100 leading-tight">{store.name}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              <span className="line-clamp-1">{store.address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Manager Info',
      cell: (store) => (
        <div className="py-0.5">
          <p className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 leading-tight">
            {store.manager?.name || 'Unassigned'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <Phone className="w-2.5 h-2.5" />
            <span>{store.phone || store.manager?.phone || 'No phone'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Hours',
      cell: (store) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 font-medium whitespace-nowrap text-[10px] px-1.5 py-0">
          {store.openingTime} - {store.closingTime}
        </Badge>
      ),
    },
    {
      header: 'Modules',
      cell: (store) => (
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {store.posEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">POS</Badge>}
          {store.deliveryEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">DLV</Badge>}
          {store.clickCollectEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">C&C</Badge>}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (store) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(store);
          }}
          disabled={updateStatus.isPending}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 ${
            store.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              store.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (store) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
            onMouseEnter={() => prefetchStore(store.id)}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stores/edit/${store.id}`);
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    }
  ], [updateStatus, navigate, prefetchStore]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 text-foreground">
      <PageHeader
        title="Store Dashboard"
        breadcrumb={['Home', 'Stores', 'Dashboard']}
        actions={
          <Button size="sm" onClick={() => navigate('/stores/create')} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm h-8 px-3 text-[11px] font-semibold tracking-wide">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Franchise Store
          </Button>
        }
      />

      <div className="w-full px-4 sm:px-6 py-3 space-y-3">
        {/* Analytics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            title="Total Stores"
            value={meta.total}
            icon={Building2}
            color="text-primary-600 bg-primary-100"
          />
          <StatCard
            title="Active Stores"
            value={activeCount}
            icon={Power}
            color="text-emerald-600 bg-emerald-100"
          />
          <StatCard
            title="Inactive Stores"
            value={inactiveCount}
            icon={Power}
            color="text-rose-600 bg-rose-100"
          />
          <StatCard
            title="Total Staff"
            value={totalStaffCount}
            icon={User}
            color="text-blue-600 bg-blue-100"
          />
        </div>

        {/* Filters Row */}
        <FilterContainer className="mb-4">
          <div className="w-full sm:w-72">
            <FilterSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name, address or phone"
            />
          </div>
          <FilterSelect
            value={status}
            onChange={setStatus}
            placeholder="All Status"
            options={STORE_STATUS_OPTIONS}
          />
          <FilterSelect
            value={module}
            onChange={setModule}
            placeholder="All Modules"
            options={STORE_MODULE_OPTIONS}
          />
          <FilterReset onClick={handleResetFilters} />
        </FilterContainer>

        {/* Data Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <DataTable
            columns={columns}
            data={stores}
            isLoading={isLoading}
            loadingSkeleton={<TableSkeleton cols={6} rows={10} />}
            serverSide={true}
            totalItems={meta.total}
            page={page}
            itemsPerPage={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            emptyIcon={<EmptyStoreIllustration />}
            emptyMessage="No stores found matching your filters."
          />
        </div>
      </div>
    </div>
  );
}
