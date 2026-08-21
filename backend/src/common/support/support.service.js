import { prisma } from "../../../config/prisma.js";

export class SupportService {
  /**
   * Generate a readable ticket number (e.g., TKT-849102)
   */
  generateTicketNumber() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `TKT-${randomDigits}`;
  }

  /**
   * Helper to resolve a valid User ID in DB
   */
  async resolveUserId(userId) {
    if (userId && typeof userId === "string" && userId !== "anonymous-customer") {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (existingUser) return existingUser.id;
    }

    // Fallback to first active user in database
    const defaultUser = await prisma.user.findFirst({
      select: { id: true },
    });
    return defaultUser?.id || null;
  }

  /**
   * Helper to resolve a valid Order ID in DB
   */
  async resolveOrderId(orderId) {
    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return null;
    }
    const trimmed = orderId.trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { orderNumber: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    return order ? order.id : null;
  }

  /**
   * Helper to resolve a valid Store ID in DB
   */
  async resolveStoreId(storeId) {
    if (!storeId || typeof storeId !== "string" || !storeId.trim()) {
      return null;
    }
    const trimmed = storeId.trim();
    const store = await prisma.store.findUnique({
      where: { id: trimmed },
      select: { id: true },
    });
    return store ? store.id : null;
  }

  /**
   * Create a new support ticket (Raised by Customer)
   */
  async createTicket({ userId, category = "OTHER", subject, description, orderId = null, storeId = null, priority = "MEDIUM" }) {
    const ticketNumber = this.generateTicketNumber();

    // 1. Resolve foreign keys safely so DB constraints never fail
    const validUserId = await this.resolveUserId(userId);
    if (!validUserId) {
      throw new Error("Cannot create ticket: No user record found in the database.");
    }

    const validOrderId = await this.resolveOrderId(orderId);
    const validStoreId = await this.resolveStoreId(storeId);

    // If customer entered an order string that didn't match a DB order UUID/number, append to description for support visibility
    let finalDescription = description.trim();
    if (orderId && !validOrderId && !finalDescription.includes(orderId)) {
      finalDescription += `\n\n[Referenced Order: ${orderId}]`;
    }

    const validCategories = ["DELIVERY", "MISSING_ITEMS", "QUALITY", "REFUND", "PAYMENT", "APP_ISSUE", "OTHER"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const normalizedCategory = validCategories.includes(category) ? category : "OTHER";
    const normalizedPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

    // 2. Create ticket in PostgreSQL
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: validUserId,
        category: normalizedCategory,
        subject: subject.trim(),
        description: finalDescription,
        orderId: validOrderId,
        storeId: validStoreId,
        priority: normalizedPriority,
        status: "OPEN",
      },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        order: { select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    // 3. Create initial customer message record
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: validUserId,
        senderRole: "CUSTOMER",
        message: finalDescription,
      },
    });

    return ticket;
  }

  /**
   * Get all tickets belonging to a specific Customer
   */
  async getCustomerTickets(userId, { status } = {}) {
    const whereClause = {};

    if (userId && userId !== "ALL") {
      whereClause.userId = userId;
    }
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return tickets;
  }

  /**
   * Get full ticket details with complete message timeline
   */
  async getTicketById(ticketId, userId = null, isAdmin = false) {
    const whereClause = {
      OR: [
        { id: ticketId },
        { ticketNumber: ticketId },
      ],
    };

    if (!isAdmin && userId) {
      whereClause.userId = userId;
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        order: { select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    return ticket;
  }

  /**
   * Add message/reply to a ticket
   */
  async addTicketMessage({ ticketId, senderId, senderRole = "CUSTOMER", message, attachments = [] }) {
    // 1. Check ticket exists
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId },
        ],
      },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      throw new Error("Support ticket not found");
    }

    // 2. Resolve sender ID
    let validSenderId = senderId;
    const existingSender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true },
    });

    if (!existingSender) {
      if (senderRole === "CUSTOMER") {
        validSenderId = ticket.userId;
      } else {
        const admin = await prisma.user.findFirst({
          where: { role: "SUPER_ADMIN" },
          select: { id: true },
        }) || await prisma.user.findFirst({ select: { id: true } });
        validSenderId = admin?.id || ticket.userId;
      }
    }

    // 3. Create message in DB
    const createdMsg = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: validSenderId,
        senderRole,
        message: message.trim(),
        attachments: attachments || [],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // 4. Update ticket updatedAt and reopen/progress status
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        updatedAt: new Date(),
        ...(senderRole === "CUSTOMER" ? { status: "OPEN" } : { status: "IN_PROGRESS" }),
      },
    });

    return createdMsg;
  }

  /**
   * Get all tickets for Super Admin with search, filter, and pagination
   */
  async getAllTicketsForAdmin({ status, priority, category, search, page = 1, limit = 20 } = {}) {
    const whereClause = {};

    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (priority && priority !== "ALL") {
      whereClause.priority = priority;
    }
    if (category && category !== "ALL") {
      whereClause.category = category;
    }
    if (search && search.trim().length > 0) {
      const s = search.trim();
      whereClause.OR = [
        { ticketNumber: { contains: s, mode: "insensitive" } },
        { subject: { contains: s, mode: "insensitive" } },
        { user: { name: { contains: s, mode: "insensitive" } } },
        { user: { phone: { contains: s, mode: "insensitive" } } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
          order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.supportTicket.count({ where: whereClause }),
    ]);

    return {
      tickets,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / take) || 1,
      },
    };
  }

  /**
   * Update ticket status or resolution notes (Super Admin)
   */
  async updateTicketStatus(ticketId, { status, priority, resolutionNote }) {
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "RESOLVED" || status === "CLOSED") {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (resolutionNote !== undefined) updateData.resolutionNote = resolutionNote;

    const targetTicket = await prisma.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId },
        ],
      },
      select: { id: true },
    });

    if (!targetTicket) {
      return null;
    }

    const updated = await prisma.supportTicket.update({
      where: { id: targetTicket.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    });

    return updated;
  }

  /**
   * Get Support Metrics Overview (Open, In Progress, Resolved Today, High Priority)
   */
  async getSupportStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [openCount, inProgressCount, resolvedTodayCount, urgentCount, totalCount] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "RESOLVED", resolvedAt: { gte: today } } }),
      prisma.supportTicket.count({ where: { priority: "URGENT", status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      prisma.supportTicket.count(),
    ]);

    return {
      openTickets: openCount,
      inProgressTickets: inProgressCount,
      resolvedToday: resolvedTodayCount,
      urgentTickets: urgentCount,
      totalTickets: totalCount,
    };
  }
}

export const supportService = new SupportService();

