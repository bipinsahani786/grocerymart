import { inventoryService } from "./inventory.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { cacheService } from "../../common/cache/cache.service.js";

async function clearInventoryCache(storeId) {
  const storeKey = storeId || "default";
  await cacheService.delPattern(`inventory:${storeKey}:*`);
}

export class InventoryController {
  getInventory = catchAsync(async (req, res) => {
    const storeId = req.query.storeId || "default";
    const q = req.query.q || "";
    const cacheKey = `inventory:${storeId}:${q}`;

    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const result = await inventoryService.getInventory(req.user, req.query.storeId, req.query.q);
    
    // Cache for 1 minute (60 seconds)
    await cacheService.set(cacheKey, result, 60);

    res.json(result);
  });

  createProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.createProduct(req.user, req.query.storeId, req.body);
    await clearInventoryCache(req.query.storeId);
    res.status(201).json(result);
  });

  updateProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.updateProduct(req.user, req.query.storeId, req.params.id, req.body);
    await clearInventoryCache(req.query.storeId);
    res.json(result);
  });

  deleteProduct = catchAsync(async (req, res) => {
    const result = await inventoryService.deleteProduct(req.user, req.query.storeId, req.params.id);
    await clearInventoryCache(req.query.storeId);
    res.json(result);
  });

  importMasterProducts = catchAsync(async (req, res) => {
    const result = await inventoryService.importMasterProducts(req.user, req.query.storeId, req.body.productIds);
    await clearInventoryCache(req.query.storeId);
    res.json(result);
  });

  getMasterCatalog = catchAsync(async (req, res) => {
    const result = await inventoryService.getMasterCatalog(req.user);
    res.json(result);
  });

  adjustInventory = catchAsync(async (req, res) => {
    const result = await inventoryService.adjustInventory(req.user, req.query.storeId, req.params.productId, req.body.delta);
    await clearInventoryCache(req.query.storeId);
    res.json(result);
  });
}

export const inventoryController = new InventoryController();
