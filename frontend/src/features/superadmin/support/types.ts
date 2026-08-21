export interface TicketSender {
  id: string;
  name: string;
  avatar?: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'SUPER_ADMIN' | 'SYSTEM';
  message: string;
  attachments?: string[];
  createdAt: string;
  sender?: TicketSender;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  orderId?: string | null;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  order?: {
    id: string;
    orderNumber?: string;
    totalAmount?: number;
    status?: string;
    createdAt?: string;
  } | null;
  messages?: TicketMessage[];
}

export interface SupportStats {
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  urgentTickets: number;
  totalTickets: number;
}

export interface TicketFilterParams {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}
