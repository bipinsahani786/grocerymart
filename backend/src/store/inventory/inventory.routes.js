import express from "express";
import { inventoryController } from "./inventory.controller.js";

const router = express.Router();

router.get("/", inventoryController.getInventory);
router.post("/", inventoryController.createProduct);
router.get("/master-catalog", inventoryController.getMasterCatalog);
router.post("/import-master", inventoryController.importMasterProducts);
router.patch("/:id", inventoryController.updateProduct);
router.delete("/:id", inventoryController.deleteProduct);
router.patch("/:productId/adjust", inventoryController.adjustInventory);

export default router;
