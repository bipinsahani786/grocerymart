import express from "express";
import { customerStoresController } from "./stores.controller.js";

const router = express.Router();

// GET /api/customer/stores
router.get("/", customerStoresController.getStores);

// GET /api/customer/location-by-pincode
router.get("/location-by-pincode", customerStoresController.getLocationByPincode);

export default router;
