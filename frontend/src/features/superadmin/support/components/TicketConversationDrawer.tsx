import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LifeBuoy,
  X,
  Send,
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle2,
  Archive,
  User,
  ShoppingBag,
  Phone,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/store/layoutStore';
import type { SupportTicket } from '../types';
import { CATEGORY_MAP, QUICK_REPLIES } from '../constants';

interface TicketConversationDrawerProps {
  ticket: SupportTicket | null;
  onClose: () => void;
  onSendReply: (ticketId: string, message: string) => Promise<boolean>;
  onUpdateStatus: (
    ticketId: string,
    status: string,
    priority?: string,
    resolutionNote?: string
  ) => Promise<boolean>;
}

export const TicketConversationDrawer: React.FC<TicketConversationDrawerProps> = ({
  ticket,
  onClose,
  onSendReply,
  onUpdateStatus,
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedTicketId, setCopiedTicketId] = useState(false);
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed);

  // Handle Escape key to close
  useEffect(() => {
    if (!ticket) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ticket, onClose]);

  if (!ticket) return null;

  const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER;

  const handleSend = async () => {
    if (!replyMessage.trim() || isSending) return;
    setIsSending(true);
    const success = await onSendReply(ticket.id, replyMessage.trim());
    if (success) {
      setReplyMessage('');
    }
    setIsSending(false);
  };

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(ticket.ticketNumber);
    setCopiedTicketId(true);
    toast.success(`Ticket #${ticket.ticketNumber} copied`);
    setTimeout(() => setCopiedTicketId(false), 2000);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return createPortal(
    <div
      className={cn(
        "fixed top-14 bottom-0 right-0 z-40 flex justify-end transition-all duration-200",
        isSidebarCollapsed ? "left-0 lg:left-[56px]" : "left-0 lg:left-[190px]"
      )}
    >
      {/* ── Content Area Backdrop overlay (below topbar and beside sidebar) ── */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* ── Slideover Drawer Panel ── */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Elevated Drawer Header ── */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center font-black shrink-0 shadow-xs">
              <LifeBuoy className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={copyTicketNumber}
                  className="flex items-center gap-1 font-mono font-black text-primary-600 dark:text-primary-400 text-xs px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition cursor-pointer"
                  title="Click to copy"
                >
                  <span>{ticket.ticketNumber}</span>
                  {copiedTicketId ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-black border inline-flex items-center gap-1 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 shadow-xs">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider',
                    ticket.priority === 'URGENT' && 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
                    ticket.priority === 'HIGH' && 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
                    ticket.priority === 'MEDIUM' && 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
                    ticket.priority === 'LOW' && 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                  )}
                >
                  {ticket.priority}
                </span>
              </div>

              <h2 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate max-w-md tracking-tight">
                {ticket.subject}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition shrink-0 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar min-h-0">
          {/* Customer & Linked Order Detail Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Box */}
            <div className="p-3.5 bg-gradient-to-br from-slate-50 to-white dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <User className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Customer Profile</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-black text-xs shrink-0">
                  {ticket.user?.name ? ticket.user.name[0].toUpperCase() : 'C'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white truncate">
                    {ticket.user?.name || 'Guest Customer'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{ticket.user?.phone || 'No phone'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Box */}
            <div className="p-3.5 bg-gradient-to-br from-slate-50 to-white dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Linked Order</span>
              </div>

              {ticket.order ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-primary-600 text-xs">
                      #{ticket.order.orderNumber || ticket.order.id.slice(0, 8)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ticket.order.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    Order Total: <span className="font-black text-slate-900 dark:text-white">₹{ticket.order.totalAmount}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic mt-1">No order linked (Account/App Query)</div>
              )}
            </div>
          </div>

          {/* Status Quick Action Bar */}
          <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                Update Ticket Status
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
                  ticket.status === 'OPEN' && 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                  ticket.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                  ticket.status === 'RESOLVED' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                  ticket.status === 'CLOSED' && 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-300'
                )}
              >
                Current: {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdateStatus(ticket.id, 'OPEN')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs border cursor-pointer',
                  ticket.status === 'OPEN'
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Open
              </button>

              <button
                onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs border cursor-pointer',
                  ticket.status === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                In Progress
              </button>

              <button
                onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs border cursor-pointer',
                  ticket.status === 'RESOLVED'
                    ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved ✅
              </button>

              <button
                onClick={() => onUpdateStatus(ticket.id, 'CLOSED')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs border cursor-pointer',
                  ticket.status === 'CLOSED'
                    ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-500/20'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                )}
              >
                <Archive className="w-3.5 h-3.5" />
                Close
              </button>
            </div>
          </div>

          {/* Conversation Messages Thread */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
                Live Conversation Thread
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {ticket.messages?.length || 1} messages
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((m) => {
                  const isAdmin = m.senderRole === 'SUPER_ADMIN';
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col max-w-[85%] animate-fade-in',
                        isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-black text-slate-500 dark:text-zinc-400">
                          {isAdmin ? '🛡️ Super Admin Support' : `👤 ${ticket.user?.name || 'Customer'}`}
                        </span>
                        <span className="text-[9px] text-slate-400">{formatTimeAgo(m.createdAt)}</span>
                      </div>

                      <div
                        className={cn(
                          'p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs',
                          isAdmin
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-tl-xs border border-slate-200/90 dark:border-zinc-700'
                        )}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-200">
                  <p className="font-bold mb-1 text-slate-900 dark:text-white">Customer Inquiry Description:</p>
                  <p className="leading-relaxed">{ticket.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Reply Pills */}
          <div className="space-y-1.5 pt-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Response Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyMessage(qr)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-[11px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:border-primary-300 dark:hover:border-primary-800 hover:text-primary-700 dark:hover:text-primary-300 transition text-left shadow-xs cursor-pointer"
                >
                  {qr.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Elevated Reply Composer Footer ── */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-md shrink-0">
          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder="Type your response to the customer..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
              className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none transition"
            />
            <Button
              onClick={handleSend}
              disabled={!replyMessage.trim() || isSending}
              className="h-auto px-5 font-black text-xs gap-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm self-end py-3 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-slate-400">Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono text-[9px] border">Ctrl + Enter</kbd> to send</span>
            <span className="text-[10px] text-slate-400">{replyMessage.length} chars</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

