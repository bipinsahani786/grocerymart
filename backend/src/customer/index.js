import express from "express";

import productsRoutes from "./products/products.routes.js";
import storesRoutes from "./stores/stores.routes.js";
import addressesRoutes from "./addresses/addresses.routes.js";

const router = express.Router();

// ── Feature Sub-routers ──
// /api/customer/products
router.use("/products", productsRoutes);

// /api/customer/stores & /api/customer/location-by-pincode
router.use("/stores", storesRoutes);
router.use("/", storesRoutes);

// /api/customer/profile & /api/customer/addresses
router.use("/", addressesRoutes);

export default router;
