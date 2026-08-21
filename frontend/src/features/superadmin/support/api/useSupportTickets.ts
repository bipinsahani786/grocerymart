import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { SupportTicket, SupportStats, TicketFilterParams } from '../types';

export function useSupportTickets(filters: TicketFilterParams) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    openTickets: 0,
    inProgressTickets: 0,
    resolvedToday: 0,
    urgentTickets: 0,
    totalTickets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/support/stats');
      if (res.data?.status === 'success' && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load stats', err);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();

      const res = await api.get('/admin/support/tickets', { params });
      if (res.data?.status === 'success') {
        setTickets(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.category, filters.priority, filters.search]);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  const refreshAll = () => {
    fetchStats();
    fetchTickets();
  };

  const getTicketDetails = async (ticketId: string): Promise<SupportTicket | null> => {
    try {
      const res = await api.get(`/admin/support/tickets/${ticketId}`);
      if (res.data?.status === 'success' && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Failed to load ticket details', err);
    }
    return null;
  };

  const sendReply = async (ticketId: string, message: string): Promise<boolean> => {
    try {
      const res = await api.post(`/admin/support/tickets/${ticketId}/messages`, {
        message: message.trim(),
      });
      if (res.data?.status === 'success') {
        toast.success('Reply sent to customer');
        refreshAll();
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    }
    return false;
  };

  const updateTicketStatus = async (
    ticketId: string,
    status: string,
    priority?: string,
    resolutionNote?: string
  ): Promise<boolean> => {
    try {
      const res = await api.patch(`/admin/support/tickets/${ticketId}`, {
        status,
        ...(priority ? { priority } : {}),
        ...(resolutionNote ? { resolutionNote } : {}),
      });

      if (res.data?.status === 'success') {
        toast.success(`Ticket marked as ${status.replace('_', ' ')}`);
        refreshAll();
        return true;
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    }
    return false;
  };

  return {
    tickets,
    stats,
    isLoading,
    refreshAll,
    getTicketDetails,
    sendReply,
    updateTicketStatus,
  };
}
