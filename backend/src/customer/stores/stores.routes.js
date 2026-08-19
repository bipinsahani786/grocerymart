import express from "express";
import { customerStoresController } from "./stores.controller.js";

const router = express.Router();

// GET /api/customer/stores
router.get("/", customerStoresController.getStores);

// GET /api/customer/location-by-pincode
router.get("/location-by-pincode", customerStoresController.getLocationByPincode);

// GET /api/customer/delivery-rate & /api/customer/delivery-config
router.get("/delivery-rate", customerStoresController.getDeliveryConfig);
router.get("/delivery-config", customerStoresController.getDeliveryConfig);

export default router;
