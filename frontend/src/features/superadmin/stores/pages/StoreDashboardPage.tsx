import { useState, useMemo, useEffect } from 'react';
import { Store, Building2, Plus, User, Power, Edit, MapPin, Phone, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterContainer, FilterSearch, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { useStores, useUpdateStoreStatus, usePrefetchStore, useDeleteStore, getStoreSlug } from '../api/useStores';
import type { Store as StoreType } from '../types';
import { STORE_STATUS_OPTIONS, STORE_MODULE_OPTIONS } from '@/constants/options';

const EmptyStoreIllustration = () => (
  <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm mb-3">
    <Store className="w-8 h-8 stroke-[1.75]" />
  </div>
);

export default function StoreDashboardPage() {
  const navigate = useNavigate();
  const prefetchStore = usePrefetchStore();
  const deleteStore = useDeleteStore();

  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);

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

  const handleToggleStatus = (store: StoreType) => {
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

  const columns: ColumnDef<StoreType>[] = useMemo(() => [
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
      header: 'Operations',
      cell: (store) => (
        <div className="py-0.5">
          <div className="flex items-center gap-1.5 mb-1 text-[12px] text-slate-700 dark:text-slate-300 font-medium">
            <Users className="w-3 h-3 text-primary-500" />
            <span>Staff: {store._count?.users || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>Radius: {store.radiusKm} km</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact & Legal',
      cell: (store) => (
        <div className="py-0.5">
          <div className="flex items-center gap-1 text-[12px] text-slate-800 dark:text-slate-200 font-medium mb-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{store.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <span className="font-semibold text-slate-400">GST:</span>
            <span>{store.gstin || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Hours',
      cell: (store) => (
        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap text-[10px] px-1.5 py-0 border-slate-200 dark:border-slate-700">
          {store.openingTime} - {store.closingTime}
        </Badge>
      ),
    },
    {
      header: 'Modules',
      cell: (store) => (
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {store.posEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">POS</Badge>}
          {store.deliveryEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">DLV</Badge>}
          {store.clickCollectEnabled && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">C&C</Badge>}
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
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 ${store.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${store.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
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
            className="h-7 w-7 p-0 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40"
            title="Edit Store"
            onMouseEnter={() => prefetchStore(store.id)}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stores/edit/${getStoreSlug(store)}`);
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Store"
            onClick={(e) => {
              e.stopPropagation();
              setStoreToDelete(store);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    }
  ], [updateStatus, navigate, prefetchStore]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-200">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* ── Analytics Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <CustomKpiCard
            title="Total Stores"
            value={meta.total}
            icon={<Building2 className="w-5 h-5" />}
            subtitle="Registered franchises"
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Active Stores"
            value={activeCount}
            icon={<Power className="w-5 h-5" />}
            subtitle="Currently operating"
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Inactive Stores"
            value={inactiveCount}
            icon={<Power className="w-5 h-5" />}
            subtitle="Paused or offline"
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Total Staff"
            value={totalStaffCount}
            icon={<User className="w-5 h-5" />}
            subtitle="Active employees"
            colorClass="bg-primary-500"
          />
        </div>

        {/* Filters Row */}
        <FilterContainer className="mb-4 flex items-center">
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

          <div className="ml-auto">
            <Button size="sm" onClick={() => navigate('/stores/create')} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm h-9 px-4 text-xs font-bold tracking-wide rounded-md transition-colors shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Franchise Store
            </Button>
          </div>
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

        {/* ── Confirm Delete Store Modal (Direct Confirm / Cancel) ── */}
        <DeleteConfirmModal
          isOpen={!!storeToDelete}
          onClose={() => setStoreToDelete(null)}
          onConfirm={() => {
            if (storeToDelete) {
              deleteStore.mutate(storeToDelete.id);
            }
          }}
          title="Delete Franchise Store"
          description="Are you sure you want to delete this store? This action cannot be undone."
          itemName={storeToDelete?.name}
        />

      </div>
    </div>
  );
}
