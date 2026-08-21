import { apiClient, ApiResponse } from './apiClient';
import { AsyncStorageService, STORAGE_KEYS } from './storage.service';

const storageService = new AsyncStorageService();

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
  order?: {
    id: string;
    orderNumber?: string;
    totalAmount?: number;
    status?: string;
  } | null;
  user?: {
    id: string;
    name?: string;
    phone?: string;
  } | null;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'SUPER_ADMIN' | 'SYSTEM';
  message: string;
  attachments?: string[];
  createdAt: string;
  sender?: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export interface CreateTicketDTO {
  category: string;
  subject: string;
  description: string;
  orderId?: string | null;
  storeId?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class SupportService {
  private async getAuthCredentials() {
    const token = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const user =
      (await storageService.getItem<{ id: string }>(STORAGE_KEYS.AUTH_USER)) ||
      (await storageService.getItem<{ id: string }>(STORAGE_KEYS.USER_PROFILE));
    return { token, userId: user?.id };
  }

  /**
   * Fetch tickets raised by current logged in user
   */
  async getMyTickets(status: string = 'ALL'): Promise<SupportTicket[]> {
    const { token, userId } = await this.getAuthCredentials();

    const response = await apiClient.get<SupportTicket[]>('/api/customer/support/tickets', {
      token,
      params: {
        status,
        ...(userId ? { userId } : {}),
      },
    });

    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  /**
   * Fetch single ticket details with full conversation timeline
   */
  async getTicketDetails(ticketId: string): Promise<SupportTicket | null> {
    const { token, userId } = await this.getAuthCredentials();

    const response = await apiClient.get<SupportTicket>(`/api/customer/support/tickets/${ticketId}`, {
      token,
      params: {
        ...(userId ? { userId } : {}),
      },
    });

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  /**
   * Raise a new customer support ticket
   */
  async createTicket(data: CreateTicketDTO): Promise<SupportTicket | null> {
    const { token, userId } = await this.getAuthCredentials();

    const response = await apiClient.post<SupportTicket>('/api/customer/support/tickets', {
      ...data,
      ...(userId ? { userId } : {}),
    }, {
      token,
    });

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  /**
   * Send a reply message in a ticket conversation
   */
  async sendTicketMessage(ticketId: string, message: string): Promise<TicketMessage | null> {
    const { token, userId } = await this.getAuthCredentials();

    const response = await apiClient.post<TicketMessage>(`/api/customer/support/tickets/${ticketId}/messages`, {
      message,
      ...(userId ? { userId } : {}),
    }, {
      token,
    });

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }
}

export const supportService = new SupportService();
