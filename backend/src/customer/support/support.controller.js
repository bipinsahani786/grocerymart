import { supportService } from "../../common/support/support.service.js";

export class CustomerSupportController {
  /**
   * POST /api/customer/support/tickets
   * Raise a new customer support ticket
   */
  async createTicket(req, res) {
    try {
      const userId = req.user?.id || req.body.userId || "anonymous-customer";
      const { category, subject, description, orderId, storeId, priority } = req.body;

      if (!subject || !description) {
        return res.status(400).json({
          status: "error",
          message: "Subject and description are required to raise a ticket.",
        });
      }

      const ticket = await supportService.createTicket({
        userId,
        category: category || "OTHER",
        subject: subject.trim(),
        description: description.trim(),
        orderId: orderId || null,
        storeId: storeId || null,
        priority: priority || "MEDIUM",
      });

      return res.status(201).json({
        status: "success",
        message: "Support ticket created successfully",
        data: ticket,
      });
    } catch (err) {
      console.error("CustomerSupportController createTicket error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to create support ticket",
      });
    }
  }

  /**
   * GET /api/customer/support/tickets
   * Fetch all tickets raised by customer
   */
  async getMyTickets(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      if (!userId) {
        return res.status(200).json({
          status: "success",
          data: [],
        });
      }

      const status = req.query.status || "ALL";
      const tickets = await supportService.getCustomerTickets(userId, { status });

      return res.status(200).json({
        status: "success",
        data: tickets,
      });
    } catch (err) {
      console.error("CustomerSupportController getMyTickets error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to fetch support tickets",
      });
    }
  }

  /**
   * GET /api/customer/support/tickets/:id
   * Get single ticket detail & full message timeline
   */
  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.query.userId;

      const ticket = await supportService.getTicketById(id, userId, false);
      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Ticket not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (err) {
      console.error("CustomerSupportController getTicketDetails error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to fetch ticket details",
      });
    }
  }

  /**
   * POST /api/customer/support/tickets/:id/messages
   * Customer reply to ticket
   */
  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.body.userId || "anonymous-customer";
      const { message, attachments } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Message content cannot be empty",
        });
      }

      const createdMsg = await supportService.addTicketMessage({
        ticketId: id,
        senderId: userId,
        senderRole: "CUSTOMER",
        message: message.trim(),
        attachments: attachments || [],
      });

      return res.status(201).json({
        status: "success",
        message: "Message sent",
        data: createdMsg,
      });
    } catch (err) {
      console.error("CustomerSupportController addMessage error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to send message",
      });
    }
  }
}

export const customerSupportController = new CustomerSupportController();
