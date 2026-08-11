import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

import dashboardRoutes from "./dashboard/dashboard.routes.js";
import settingsRoutes from "./settings/settings.routes.js";
import taxesRoutes from "./taxes/taxes.routes.js";
import categoriesRoutes from "./categories/categories.routes.js";
import inventoryRoutes from "./inventory/inventory.routes.js";
import ordersRoutes from "./orders/orders.routes.js";
import pickupRoutes from "./orders/pickup.routes.js";
import billsRoutes from "./orders/bills.routes.js";
import customersRoutes from "./customers/customers.routes.js";
import staffRoutes from "./staff/staff.routes.js";
import offersRoutes from "./offers/offers.routes.js";
import subscriptionsRoutes from "./subscriptions/subscriptions.routes.js";
import purchasesRoutes from "./purchases/purchases.routes.js";

const router = express.Router();

// Apply auth verification middleware to all store panel endpoints
router.use(verifyToken);

// Mount feature-based sub-routers
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRoutes);
router.use("/taxes", taxesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", ordersRoutes);
router.use("/pickup", pickupRoutes);
router.use("/bills", billsRoutes);
router.use("/customers", customersRoutes);
router.use("/staff", staffRoutes);
router.use("/offers", offersRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/purchases", purchasesRoutes);

export default router;
