import { supportService } from "../../common/support/support.service.js";

export class AdminSupportController {
  /**
   * GET /api/admin/support/tickets
   * Fetch all tickets with search, filters (status, priority, category) & pagination
   */
  async getTickets(req, res) {
    try {
      const { status, priority, category, search, page = 1, limit = 20 } = req.query;

      const result = await supportService.getAllTicketsForAdmin({
        status,
        priority,
        category,
        search,
        page,
        limit,
      });

      return res.status(200).json({
        status: "success",
        data: result.tickets,
        pagination: result.pagination,
      });
    } catch (err) {
      console.error("AdminSupportController getTickets error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to fetch tickets",
      });
    }
  }

  /**
   * GET /api/admin/support/stats
   * Fetch overall support stats (Open, In Progress, Resolved Today, Urgent)
   */
  async getStats(req, res) {
    try {
      const stats = await supportService.getSupportStats();
      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (err) {
      console.error("AdminSupportController getStats error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to fetch support statistics",
      });
    }
  }

  /**
   * GET /api/admin/support/tickets/:id
   * Fetch complete ticket details with conversation thread
   */
  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const ticket = await supportService.getTicketById(id, null, true);

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
      console.error("AdminSupportController getTicketDetails error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to fetch ticket details",
      });
    }
  }

  /**
   * PATCH /api/admin/support/tickets/:id
   * Update status, priority, or add resolution note
   */
  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { status, priority, resolutionNote } = req.body;

      const updated = await supportService.updateTicketStatus(id, {
        status,
        priority,
        resolutionNote,
      });

      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Ticket not found or could not be updated",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Ticket updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("AdminSupportController updateTicket error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to update ticket",
      });
    }
  }

  /**
   * POST /api/admin/support/tickets/:id/messages
   * Super Admin reply to customer ticket
   */
  async replyToTicket(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id || "super-admin";
      const { message, attachments } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Message text is required to reply",
        });
      }

      const createdMsg = await supportService.addTicketMessage({
        ticketId: id,
        senderId: adminId,
        senderRole: "SUPER_ADMIN",
        message: message.trim(),
        attachments: attachments || [],
      });

      return res.status(201).json({
        status: "success",
        message: "Reply sent to customer successfully",
        data: createdMsg,
      });
    } catch (err) {
      console.error("AdminSupportController replyToTicket error:", err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Failed to reply to ticket",
      });
    }
  }
}

export const adminSupportController = new AdminSupportController();
