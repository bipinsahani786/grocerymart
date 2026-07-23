import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Percent, CalendarClock, Box } from 'lucide-react';
import { useTaxes } from '../api/useTaxes';
import type { TaxClass } from '../schemas/taxSchemas';
import { CreateTaxModal } from '../components/CreateTaxModal';
import { ScheduleRateModal } from '../components/ScheduleRateModal';

export function TaxManagementPage() {
  const { taxes, isLoading } = useTaxes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaxForRate, setSelectedTaxForRate] = useState<TaxClass | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading tax classes...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Management"
        subtitle="Manage tax profiles, components, and schedule future tax changes."
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Tax Class
          </Button>
        }
      />

      <div className="p-6">
        {taxes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              No tax classes found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      Tax Class
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      Active Rate
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 text-center">
                      Products
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                  {taxes.map((tax) => (
                    <tr key={tax.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                            <Percent className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">{tax.name}</div>
                            {tax.description && (
                              <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{tax.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <Badge variant={tax.isActive ? 'default' : 'secondary'} className={tax.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}>
                          {tax.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 align-top">
                        {tax.currentActiveRate ? (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {tax.currentTotalRate}%
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {tax.currentActiveRate.components.map(c => (
                                <span key={c.id} className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                  {c.name}: {c.rate}%
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">No active rate</span>
                        )}
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          {tax._count.products}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-900/50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                          onClick={() => setSelectedTaxForRate(tax)}
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          Schedule Rate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
