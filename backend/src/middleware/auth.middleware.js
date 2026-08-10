import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";

/**
 * verifyToken — Validates JWT, checks user/store active status in DB on every request.
 * Attaches enriched req.user (with DB-verified role, storeId) for downstream use.
 */
export const verifyToken = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      status: "error",
      code: "NO_TOKEN",
      message: "Authentication token is required. Please login again.",
    });
  }

  try {
    // ✅ Decode access token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_access_secret");

    // ✅ Real-time active status check + DB-verified role (prevents stale JWT attacks)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        status: true,
        isActive: true,
        storeId: true,
        role: {
          select: {
            roleName: true,  // e.g., "super_admin", "store_manager"
            role: true,      // Enum: SUPER_ADMIN, STORE_MANAGER, etc.
          },
        },
        store: { select: { id: true, name: true, isActive: true } },
        managedStore: { select: { id: true, name: true, isActive: true } },
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: "ACCOUNT_DELETED",
        message: "Your account no longer exists. Please contact support.",
      });
    }

    if (user.status !== "active" || user.isActive === false) {
      return res.status(403).json({
        status: "error",
        code: "ACCOUNT_SUSPENDED",
        message: `Your account is currently ${user.status || "inactive"}. Access denied. Contact support.`,
      });
    }

    // Determine if super admin using DB-verified role (not stale JWT payload)
    const roleName = user.role?.roleName || "";
    const isSuperAdmin = roleName === "super_admin" || roleName === "admin";

    if (!isSuperAdmin) {
      const assignedStore = user.managedStore || user.store;
      if (assignedStore && assignedStore.isActive === false) {
        return res.status(403).json({
          status: "error",
          code: "STORE_INACTIVE",
          message: `Your franchise store "${assignedStore.name}" is currently inactive. Access denied.`,
        });
      }
    }

    // ✅ Attach enriched user to request — always DB-verified
    req.user = {
      ...decoded,                    // id, email, phone from JWT
      role: roleName,                // DB-verified role string (overrides JWT payload)
      storeId: user.store?.id || user.managedStore?.id || user.storeId || null,
      managedStore: user.managedStore || null,
      store: user.store || null,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please login again.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        code: "INVALID_TOKEN",
        message: "Invalid authentication token. Please login again.",
      });
    }
    return res.status(401).json({
      status: "error",
      code: "AUTH_FAILED",
      message: "Authentication failed. Please login again.",
    });
  }
};

/**
 * verifyAdmin — Checks DB-verified role (set by verifyToken) for Super Admin access.
 * Must always be used AFTER verifyToken middleware.
 */
export const verifyAdmin = (req, res, next) => {
  // req.user.role is now DB-verified (set by verifyToken), not stale JWT payload
  const role = req.user?.role || "";

  const isAdmin =
    role === "super_admin" ||
    role === "admin" ||
    role === "SUPER_ADMIN" ||
    role === "ADMIN";

  if (isAdmin) {
    return next();
  }

  return res.status(403).json({
    status: "error",
    code: "FORBIDDEN",
    message: "Access denied. Super Admin privileges required.",
  });
};

/**
 * verifyStoreAccess — Checks that the user has store manager or higher access.
 * Must always be used AFTER verifyToken middleware.
 */
export const verifyStoreAccess = (req, res, next) => {
  const role = req.user?.role || "";

  const hasAccess =
    role === "super_admin" ||
    role === "admin" ||
    role === "store_manager" ||
    role === "SUPER_ADMIN" ||
    role === "STORE_MANAGER";

  if (hasAccess) {
    return next();
  }

  return res.status(403).json({
    status: "error",
    code: "FORBIDDEN",
    message: "Access denied. Store Manager privileges required.",
  });
};
