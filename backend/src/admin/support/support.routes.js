import express from "express";
import { adminSupportController } from "./support.controller.js";

const router = express.Router();

// Support metrics & stats
router.get("/stats", adminSupportController.getStats);

// Ticket CRUD & details
router.get("/tickets", adminSupportController.getTickets);
router.get("/tickets/:id", adminSupportController.getTicketDetails);
router.patch("/tickets/:id", adminSupportController.updateTicket);
router.post("/tickets/:id/messages", adminSupportController.replyToTicket);

export default router;
