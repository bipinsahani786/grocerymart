import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Percent, CalendarClock, Box, CheckCircle2 } from 'lucide-react';

import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { PageLoadingSkeleton } from '@/components/ui/PageLoadingSkeleton';

import { useTaxes } from '../api/useTaxes';
import type { TaxClass } from '../schemas/taxSchemas';
import { CreateTaxModal } from '../components/CreateTaxModal';
import { ScheduleRateModal } from '../components/ScheduleRateModal';

export function TaxManagementPage() {
  const { taxes, isLoading } = useTaxes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaxForRate, setSelectedTaxForRate] = useState<TaxClass | null>(null);

  // Compute Metrics
  const stats = useMemo(() => {
    const total = taxes.length;
    const activeCount = taxes.filter((t) => t.isActive).length;
    const scheduledCount = taxes.reduce((acc, t) => {
      const future = t.rates.filter((r) => new Date(r.effectiveFrom) > new Date());
      return acc + future.length;
    }, 0);
    const totalProducts = taxes.reduce((acc, t) => acc + (t._count?.products || 0), 0);
    return { total, activeCount, scheduledCount, totalProducts };
  }, [taxes]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // DataTable Columns Definition
  const columns: ColumnDef<TaxClass>[] = [
    {
      header: 'Tax Class Name',
      accessorKey: 'name',
      cell: (tax) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 shadow-xs">
            <Percent className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
              {tax.name}
            </div>
            {tax.description && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {tax.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (tax) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-bold px-2 py-0.5 border ${
            tax.isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700'
          }`}
        >
          {tax.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Active Rate & Breakdown',
      cell: (tax) => (
        <div className="py-1 space-y-1">
          {tax.currentActiveRate ? (
            <div className="space-y-1">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {tax.currentTotalRate}%
              </div>
              <div className="flex flex-wrap gap-1">
                {tax.currentActiveRate.components.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700"
                  >
                    {c.name}: {c.rate}%
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              No active rate set
            </span>
          )}

          {/* Scheduled Future Rates */}
          {(() => {
            const futureRates = tax.rates.filter((r) => new Date(r.effectiveFrom) > new Date());
            if (futureRates.length === 0) return null;
            return (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  Scheduled Rates
                </div>
                {futureRates.map((fr) => {
                  const total = fr.components.reduce((sum, c) => sum + c.rate, 0);
                  return (
                    <div
                      key={fr.id}
                      className="text-xs p-2 bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg space-y-1"
                    >
                      <div className="text-indigo-900 dark:text-indigo-300 font-bold">
                        {total}%{' '}
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                          from {new Date(fr.effectiveFrom).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ),
    },
    {
      header: 'Covered Products',
      className: 'text-center',
      cell: (tax) => (
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Box className="w-3.5 h-3.5 text-slate-400" />
          {tax._count?.products || 0}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (tax) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-900/50 dark:text-primary-400 dark:hover:bg-primary-950/40 cursor-pointer shadow-xs"
            onClick={() => setSelectedTaxForRate(tax)}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Schedule Rate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16 pt-4 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <CustomKpiCard
            title="Total Tax Classes"
            value={stats.total}
            subtitle="Active tax profiles"
            icon={<Percent className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Active Profiles"
            value={stats.activeCount}
            subtitle="Live in store checkout"
            icon={<CheckCircle2 className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Scheduled Changes"
            value={stats.scheduledCount}
            subtitle="Future effective rates"
            icon={<CalendarClock className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
          <CustomKpiCard
            title="Products Covered"
            value={stats.totalProducts}
            subtitle="Assigned catalog items"
            icon={<Box className="w-5 h-5" />}
            colorClass="bg-primary-500"
          />
        </div>

        {/* ── Main Data Table Area ── */}
        {taxes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm mb-3">
              <Percent className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No tax classes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Create a tax class to get started managing tax profiles and rates.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Tax Class
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <DataTable
              columns={columns}
              data={taxes}
              searchable={true}
              searchPlaceholder="Search tax classes..."
              searchKeys={['name', 'description']}
              headerActions={
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white gap-1.5 shadow-sm font-semibold text-xs h-9 px-4 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Tax Class
                </Button>
              }
            />
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      <CreateTaxModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedTaxForRate && (
        <ScheduleRateModal
          isOpen={true}
          taxClass={selectedTaxForRate}
          onClose={() => setSelectedTaxForRate(null)}
        />
      )}
    </div>
  );
}

export default TaxManagementPage;
