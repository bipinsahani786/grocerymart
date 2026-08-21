import { useState, useMemo } from 'react';
import {
  RefreshCw,
  Clock,
  MessageSquare,
  CheckCircle2,
  Flame,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Global Project UI Components
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import {
  FilterContainer,
  FilterSearch,
  FilterSelect,
  FilterReset,
} from '@/components/ui/filter-controls';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

// Feature Modules
import { useSupportTickets } from './api/useSupportTickets';
import type { SupportTicket } from './types';
import {
  CATEGORY_MAP,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
} from './constants';
import { TicketConversationDrawer } from './components/TicketConversationDrawer';

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  // Hook for API calls & state
  const {
    tickets,
    stats,
    isLoading,
    refreshAll,
    getTicketDetails,
    sendReply,
    updateTicketStatus,
  } = useSupportTickets({
    search,
    status: selectedStatus,
    category: selectedCategory,
    priority: selectedPriority,
  });

  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    const detailed = await getTicketDetails(ticket.id);
    if (detailed) {
      setSelectedTicket(detailed);
    }
  };

  const handleSendReply = async (ticketId: string, message: string): Promise<boolean> => {
    const ok = await sendReply(ticketId, message);
    if (ok) {
      const detailed = await getTicketDetails(ticketId);
      if (detailed) setSelectedTicket(detailed);
    }
    return ok;
  };

  const handleUpdateStatus = async (
    ticketId: string,
    status: string,
    priority?: string,
    note?: string
  ): Promise<boolean> => {
    const ok = await updateTicketStatus(ticketId, status, priority, note);
    if (ok && selectedTicket) {
      setSelectedTicket({
        ...selectedTicket,
        status: status as any,
        ...(priority ? { priority: priority as any } : {}),
      });
    }
    return ok;
  };

  const copyTicketNumber = (tktNum: string) => {
    navigator.clipboard.writeText(tktNum);
    setCopiedTicketId(tktNum);
    toast.success(`Ticket #${tktNum} copied`);
    setTimeout(() => setCopiedTicketId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedStatus !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all';

  // Standard DataTable Column definitions
  const columns: ColumnDef<SupportTicket>[] = useMemo(
    () => [
      {
        header: 'Ticket ID',
        accessorKey: 'ticketNumber',
        cell: (ticket) => (
          <div className="flex items-center gap-1.5 font-mono font-bold text-[12px] text-primary-600 dark:text-primary-400">
            <span>{ticket.ticketNumber}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyTicketNumber(ticket.ticketNumber);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Copy Ticket ID"
            >
              {copiedTicketId === ticket.ticketNumber ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        ),
      },
      {
        header: 'Customer',
        cell: (ticket) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-[11px] shrink-0">
              {ticket.user?.name ? ticket.user.name[0].toUpperCase() : 'C'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[12.5px] text-slate-900 dark:text-slate-100 leading-tight truncate">
                {ticket.user?.name || 'Guest Customer'}
              </p>
              <p className="text-[10.5px] text-slate-400 truncate mt-0.5">
                {ticket.user?.phone || ticket.user?.email || 'No contact'}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Category',
        cell: (ticket) => {
          const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER;
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{cat.icon}</span>
              <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                {cat.label}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Subject & Order',
        cell: (ticket) => (
          <div className="max-w-xs">
            <p className="font-bold text-[12.5px] text-slate-900 dark:text-slate-100 truncate leading-snug">
              {ticket.subject}
            </p>
            {ticket.order ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.2 rounded border border-primary-200 dark:border-primary-800">
                  #{ticket.order.orderNumber || ticket.order.id.slice(0, 6)}
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium">
                  ₹{ticket.order.totalAmount}
                </span>
              </div>
            ) : (
              <p className="text-[10.5px] text-slate-400 italic">General Account Query</p>
            )}
          </div>
        ),
      },
      {
        header: 'Priority',
        cell: (ticket) => {
          const p = ticket.priority;
          return (
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider',
                p === 'URGENT' && 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
                p === 'HIGH' && 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
                p === 'MEDIUM' && 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
                p === 'LOW' && 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
              )}
            >
              {p}
            </span>
          );
        },
      },
      {
        header: 'Status',
        cell: (ticket) => {
          const s = ticket.status;
          return (
            <span
              className={cn(
                'px-2.5 py-0.8 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1',
                s === 'OPEN' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
                s === 'IN_PROGRESS' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30',
                s === 'RESOLVED' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
                s === 'CLOSED' && 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  s === 'OPEN' && 'bg-amber-500',
                  s === 'IN_PROGRESS' && 'bg-blue-500 animate-pulse',
                  s === 'RESOLVED' && 'bg-emerald-500',
                  s === 'CLOSED' && 'bg-slate-400'
                )}
              />
              {s.replace('_', ' ')}
            </span>
          );
        },
      },
      {
        header: 'Created',
        cell: (ticket) => (
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {formatTimeAgo(ticket.createdAt)}
          </span>
        ),
      },
      {
        header: 'Action',
        className: 'text-right',
        cell: (ticket) => (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTicket(ticket);
              }}
              className="h-7 text-xs font-bold px-2.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800 hover:bg-primary-100"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Inspect
            </Button>
          </div>
        ),
      },
    ],
    [copiedTicketId]
  );

  return (
    <div className="pt-2 sm:pt-3 px-4 sm:px-6 pb-6 max-w-7xl mx-auto space-y-3.5 animate-fade-in">
      {/* ── 1. Existing Global CustomKpiCard Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <CustomKpiCard
          title="Open Tickets"
          value={stats.openTickets}
          subtitle="Awaiting response"
          icon={<Clock />}
          colorClass="bg-primary-500"
          onClick={() => setSelectedStatus(selectedStatus === 'OPEN' ? 'all' : 'OPEN')}
          isActive={selectedStatus === 'OPEN'}
        />

        <CustomKpiCard
          title="In Progress"
          value={stats.inProgressTickets}
          subtitle="Under investigation"
          icon={<MessageSquare />}
          colorClass="bg-primary-500"
          onClick={() => setSelectedStatus(selectedStatus === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
          isActive={selectedStatus === 'IN_PROGRESS'}
        />

        <CustomKpiCard
          title="Resolved Today"
          value={stats.resolvedToday}
          subtitle="Successfully closed"
          icon={<CheckCircle2 />}
          colorClass="bg-primary-500"
          onClick={() => setSelectedStatus(selectedStatus === 'RESOLVED' ? 'all' : 'RESOLVED')}
          isActive={selectedStatus === 'RESOLVED'}
        />

        <CustomKpiCard
          title="Urgent Priority"
          value={stats.urgentTickets}
          subtitle="High escalation alerts"
          icon={<Flame />}
          colorClass="bg-primary-500"
          onClick={() => setSelectedPriority(selectedPriority === 'URGENT' ? 'all' : 'URGENT')}
          isActive={selectedPriority === 'URGENT'}
        />
      </div>

      {/* ── 2. FilterContainer with FilterSearch, FilterSelects & Right-Aligned Refresh Button ── */}
      <FilterContainer className="mb-4 flex items-center">
        <div className="w-full sm:w-80">
          <FilterSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by ticket #, customer name, phone..."
          />
        </div>

        <FilterSelect
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="All Statuses"
          options={STATUS_OPTIONS}
        />

        <FilterSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="All Categories"
          options={CATEGORY_OPTIONS}
        />

        <FilterSelect
          value={selectedPriority}
          onChange={setSelectedPriority}
          placeholder="All Priorities"
          options={PRIORITY_OPTIONS}
        />

        {hasActiveFilters && <FilterReset onClick={handleResetFilters} />}

        {/* Refresh Button at the Right of the Dropdown Row */}
        <div className="ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshAll}
            className="h-9 gap-1.5 text-xs font-bold shadow-sm border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </FilterContainer>

      {/* ── 3. Existing Global DataTable ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        <DataTable
          data={tickets}
          columns={columns}
          isLoading={isLoading}
          onRowClick={handleOpenTicket}
          emptyMessage="No customer support tickets match your filter criteria."
          itemsPerPage={10}
        />
      </div>

      {/* ── 4. Full Slide-over Live Conversation Drawer ── */}
      <TicketConversationDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onSendReply={handleSendReply}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
