import { inventoryRepository } from "./inventory.repository.js";
import { AppError } from "../../utils/AppError.js";
import { resolveStoreId } from "../shared.js";

export class InventoryService {
  async getInventory(user, storeIdParam, query = "") {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await inventoryRepository.products(storeId, query);
    return { success: true, data };
  }

  async createProduct(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    if (!payload.name || !payload.name.trim()) throw new AppError("Product name is required", 400);
    const data = await inventoryRepository.createProduct(storeId, payload);
    return { success: true, data, message: "Product created in store successfully" };
  }

  async updateProduct(user, storeIdParam, productId, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await inventoryRepository.updateProduct(storeId, productId, payload);
    return { success: true, data, message: "Product updated successfully" };
  }

  async deleteProduct(user, storeIdParam, productId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await inventoryRepository.deleteProduct(storeId, productId);
    return { success: true, message: "Product deleted successfully" };
  }

  async importMasterProducts(user, storeIdParam, productIds) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await inventoryRepository.importMasterProducts(storeId, productIds);
    return {
      success: true,
      data,
      message: `Successfully imported ${data.importedCount} products into your store!`,
    };
  }

  async getMasterCatalog(user) {
    const data = await inventoryRepository.getMasterCatalog();
    return { success: true, data };
  }

  async adjustInventory(user, storeIdParam, productId, delta) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await inventoryRepository.adjustInventory(storeId, productId, delta);
    return { success: true, data, message: "Stock level updated successfully" };
  }
}

export const inventoryService = new InventoryService();
