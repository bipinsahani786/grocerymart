import { Router } from "express";
import { purchasesController } from "./purchases.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

// Suppliers
router.get("/suppliers", purchasesController.getSuppliers);
router.post("/suppliers", purchasesController.createSupplier);
router.patch("/suppliers/:id", purchasesController.updateSupplier);

// Purchase Orders
router.get("/orders", purchasesController.getPurchaseOrders);
router.get("/orders/:id", purchasesController.getPurchaseOrderById);
router.post("/orders", purchasesController.createPurchaseOrder);

// Inventory Batches
router.get("/batches", purchasesController.getStoreBatches);

export default router;
