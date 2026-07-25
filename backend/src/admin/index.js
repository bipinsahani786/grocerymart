import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

import usersRoutes from "./users/users.routes.js";
import settingsRoutes from "./settings/settings.routes.js";
import ledgerRoutes from "./ledger/ledger.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import storesRoutes from "./stores/stores.routes.js";
import managersRoutes from "./managers/managers.routes.js";
import taxesRoutes from "./taxes/taxes.routes.js";

const router = express.Router();

// All admin routes require JWT authentication + admin role verification
router.use(verifyToken, verifyAdmin);

// Mount feature-based sub-routers
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/stores", storesRoutes);
router.use("/managers", managersRoutes);
router.use("/taxes", taxesRoutes);


router.use("/settings", settingsRoutes);
router.use("/logs/transactions", ledgerRoutes);

export default router;

