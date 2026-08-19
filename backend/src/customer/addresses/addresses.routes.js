import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma.js";
import { customerAddressesController } from "./addresses.controller.js";

const router = express.Router();

// Extract customer authentication from JWT Bearer token or Query Params
router.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_change_in_production");
        if (decoded && decoded.id) {
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, phone: true, email: true, name: true },
          });
          if (user) req.user = user;
        }
      } catch (_) {}
    }

    if (!req.user && (req.query.userId || req.query.phone || req.body.userId || req.body.phone)) {
      const targetId = req.query.userId || req.body.userId;
      const targetPhone = req.query.phone || req.body.phone;
      const cleanPhone = targetPhone ? String(targetPhone).replace(/^\+91/, "").replace(/\s+/g, "").trim() : null;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(targetId ? [{ id: targetId }] : []),
            ...(targetPhone ? [{ phone: targetPhone }] : []),
            ...(cleanPhone ? [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }] : []),
          ],
        },
        select: { id: true, phone: true, email: true, name: true },
      });
      if (user) req.user = user;
    }
  } catch (_) {}
  next();
});

// Profile & Addresses endpoints
router.get("/profile", customerAddressesController.getProfile);
router.get("/addresses", customerAddressesController.getAddresses);
router.post("/addresses", customerAddressesController.addAddress);
router.put("/addresses/:id", customerAddressesController.updateAddress);
router.delete("/addresses/:id", customerAddressesController.deleteAddress);

export default router;
