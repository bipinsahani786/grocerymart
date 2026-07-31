import express from "express";
import { storePanelController } from "./panel.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { uploadMemoryMiddleware } from "../../middleware/upload.middleware.js";

const router = express.Router();

// Apply auth middleware to all store panel endpoints
router.use(verifyToken);

router.get("/dashboard", storePanelController.getDashboard);

router.post("/upload", uploadMemoryMiddleware.single('file'), storePanelController.uploadImage);

router.get("/settings", storePanelController.getSettings);
router.patch("/settings", storePanelController.updateSettings);
router.put("/settings", storePanelController.updateSettings);

router.get("/categories", storePanelController.getCategories);
router.post("/categories", storePanelController.createCategory);
router.post("/categories/import-master", storePanelController.importMasterCategories);
router.patch("/categories/:id", storePanelController.updateCategory);
router.delete("/categories/:id", storePanelController.deleteCategory);

router.get("/inventory", storePanelController.getInventory);
router.post("/inventory", storePanelController.createProduct);
router.post("/inventory/import-master", storePanelController.importMasterProducts);
router.patch("/inventory/:id", storePanelController.updateProduct);
router.delete("/inventory/:id", storePanelController.deleteProduct);
router.patch("/inventory/:productId/adjust", storePanelController.adjustInventory);

router.get("/orders", storePanelController.getOrders);
router.get("/orders/:id", storePanelController.getOrderById);
router.get("/orders/:id/pdf", storePanelController.getOrderInvoicePdf);
router.post("/orders/pos", storePanelController.createPosOrder);
router.patch("/orders/:id/status", storePanelController.updateOrderStatus);

router.get("/pickup", storePanelController.getPickupQueue);
router.post("/pickup/:id/verify", storePanelController.verifyPickupPin);

router.get("/bills", storePanelController.getBills);
router.get("/customers", storePanelController.getCustomers);
router.post("/customers", storePanelController.createCustomer);
router.patch("/customers/:id", storePanelController.updateCustomer);
router.delete("/customers/:id", storePanelController.deleteCustomer);

router.get("/staff", storePanelController.getStaff);
router.post("/staff", storePanelController.createStaff);
router.patch("/staff/:id", storePanelController.updateStaff);
router.delete("/staff/:id", storePanelController.deleteStaff);
router.patch("/staff/:id/clock", storePanelController.toggleStaffClock);
router.patch("/staff/:id/shift", storePanelController.updateStaffShift);

router.get("/analytics", storePanelController.getAnalytics);

export default router;
