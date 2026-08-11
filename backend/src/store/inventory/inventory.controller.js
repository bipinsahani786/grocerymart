import { inventoryService } from "./inventory.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class InventoryController {
  getInventory = catchAsync(async (req, res) => {
    const result = await inventoryService.getInventory(req.user, req.query.storeId, req.query.q);
    res.json(result);
  });

  createProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.createProduct(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.updateProduct(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.deleteProduct(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  importMasterProducts = catchAsync(async (req, res) => {
    const result = await inventoryService.importMasterProducts(req.user, req.query.storeId, req.body.productIds);
    res.json(result);
  });

  getMasterCatalog = catchAsync(async (req, res) => {
    const result = await inventoryService.getMasterCatalog(req.user);
    res.json(result);
  });

  adjustInventory = catchAsync(async (req, res) => {
    const result = await inventoryService.adjustInventory(req.user, req.query.storeId, req.params.productId, req.body.delta);
    res.json(result);
  });
}

export const inventoryController = new InventoryController();
