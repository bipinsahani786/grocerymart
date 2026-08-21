import express from "express";

import productsRoutes from "./products/products.routes.js";
import storesRoutes from "./stores/stores.routes.js";
import addressesRoutes from "./addresses/addresses.routes.js";
import offersRoutes from "./offers/offers.routes.js";
import ordersRoutes from "./orders/orders.routes.js";
import supportRoutes from "./support/support.routes.js";

const router = express.Router();

// ── Feature Sub-routers ──
// /api/customer/orders
router.use("/orders", ordersRoutes);

// /api/customer/products & /api/customer/categories
router.use("/products", productsRoutes);
router.use("/", productsRoutes);

// /api/customer/stores & /api/customer/location-by-pincode & /api/customer/delivery-rate
router.use("/stores", storesRoutes);
router.use("/", storesRoutes);

// /api/customer/profile & /api/customer/addresses
router.use("/", addressesRoutes);

// /api/customer/offers & /api/customer/coupons
router.use("/offers", offersRoutes);
router.use("/coupons", offersRoutes);

// /api/customer/support (Support tickets, messages, help desk)
router.use("/support", supportRoutes);

export default router;
