import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma.js";
import { customerOrdersController } from "./orders.controller.js";

const router = express.Router();

// Optional auth middleware: extracts user if token exists, otherwise proceeds
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
    // If token is invalid or expired, continue without attaching req.user
  }
  next();
};

router.post("/", extractUser, customerOrdersController.createOrder);
router.get("/", extractUser, customerOrdersController.getMyOrders);
router.get("/:id", extractUser, customerOrdersController.getOrderById);

export default router;
