import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";

export const verifyToken = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ status: "error", code: "NO_TOKEN", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;

    // Real-time active status check against database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        status: true,
        isActive: true,
        role: { select: { roleName: true } },
        store: { select: { id: true, name: true, isActive: true } },
        managedStore: { select: { id: true, name: true, isActive: true } },
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: "ACCOUNT_DELETED",
        message: "Your account no longer exists. Access revoked.",
      });
    }

    if (user.status !== "active" || user.isActive === false) {
      return res.status(403).json({
        status: "error",
        code: "ACCOUNT_SUSPENDED",
        message: `Your account is currently ${user.status || 'inactive'}. Access revoked.`,
      });
    }

    const isSuperAdmin = user.role?.roleName === "super_admin" || user.role?.roleName === "admin";

    if (!isSuperAdmin) {
      const assignedStore = user.managedStore || user.store;
      if (assignedStore && assignedStore.isActive === false) {
        return res.status(403).json({
          status: "error",
          code: "STORE_INACTIVE",
          message: `Your franchise store "${assignedStore.name}" is currently inactive. Access revoked.`,
        });
      }
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: "error", code: "TOKEN_EXPIRED", message: "Token expired" });
    }
    return res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && (req.user.userType === "admin" || req.user.role === "super_admin" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({ status: "error", message: "Forbidden: Super Admin access required" });
  }
};
