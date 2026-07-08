import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

import usersRoutes from "./users/users.routes.js";
import bookingsRoutes from "./bookings/bookings.routes.js";
import ownersRoutes from "./owners/owners.routes.js";
import disputesRoutes from "./disputes/disputes.routes.js";
import settingsRoutes from "./settings/settings.routes.js";
import ledgerRoutes from "./ledger/ledger.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import parkingsRoutes from "./parkings/parkings.routes.js";
import reviewsRoutes from "./reviews/reviews.routes.js";
import dbRoutes from "./db/db.routes.js";

const router = express.Router();

// All admin routes require JWT authentication + admin role verification
router.use(verifyToken, verifyAdmin);

// Mount feature-based sub-routers
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);

router.use("/bookings", bookingsRoutes);
router.use("/owners", ownersRoutes);
router.use("/disputes", disputesRoutes);
router.use("/parkings", parkingsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/settings", settingsRoutes);
router.use("/logs/transactions", ledgerRoutes);
router.use("/db", dbRoutes);

export default router;

