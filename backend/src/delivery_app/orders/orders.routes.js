import express from "express";
import { deliveryOrdersController } from "./orders.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

/**
 * All delivery orders endpoints require authenticated delivery partner
 */
router.use(verifyToken);

router.get("/incoming", deliveryOrdersController.getIncomingOrder);
router.post("/:orderId/accept", deliveryOrdersController.acceptOrder);
router.post("/:orderId/reject", deliveryOrdersController.rejectOrder);
router.get("/active", deliveryOrdersController.getActiveOrder);
router.post("/:orderId/status", deliveryOrdersController.updateOrderStatus);
router.post("/:orderId/complete", deliveryOrdersController.completeDelivery);
router.get("/trips", deliveryOrdersController.getCompletedTrips);

export default router;
