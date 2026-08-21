import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma.js";
import { customerSupportController } from "./support.controller.js";

const router = express.Router();

// Extract user from token if available
const extractUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_access_secret");
      if (decoded?.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, phone: true, email: true, name: true, status: true, isActive: true },
        });
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch (_) {
    // Continue without token
  }
  next();
};

router.post("/tickets", extractUser, customerSupportController.createTicket);
router.get("/tickets", extractUser, customerSupportController.getMyTickets);
router.get("/tickets/:id", extractUser, customerSupportController.getTicketDetails);
router.post("/tickets/:id/messages", extractUser, customerSupportController.addMessage);

export default router;
