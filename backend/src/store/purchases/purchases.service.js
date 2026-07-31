import { purchasesRepository } from "./purchases.repository.js";
import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../../config/prisma.js";

export class PurchasesService {
  async resolveStoreId(user, storeIdParam) {
    if (user?.role === "SUPER_ADMIN") {
      if (storeIdParam) return storeIdParam;
      const firstStore = await prisma.store.findFirst({ select: { id: true } });
      if (!firstStore) throw new AppError("No store found in database", 404);
      return firstStore.id;
    }
    const storeId = user?.storeId || user?.managedStore?.id || user?.store?.id;
    if (!storeId) throw new AppError("Store context required", 400);
    return storeId;
  }

  // ── Suppliers ──
  async getSuppliers(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await purchasesRepository.getSuppliers(storeId);
    return { success: true, data };
  }

  async createSupplier(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);

    const name = payload.name?.trim();
    const phone = payload.phone?.trim();

    if (!name || name.length < 2) {
      throw new AppError("Supplier name must be at least 2 characters long", 400);
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      throw new AppError("Valid 10-digit mobile phone number is compulsory", 400);
    }

    const data = await purchasesRepository.createSupplier(storeId, {
      ...payload,
      name,
      phone,
    });
    return { success: true, data, message: "Supplier registered successfully" };
  }

  async updateSupplier(user, storeIdParam, supplierId, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    await purchasesRepository.updateSupplier(storeId, supplierId, payload);
    return { success: true, message: "Supplier updated successfully" };
  }

  // ── Purchase Orders ──
  async getPurchaseOrders(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await purchasesRepository.getPurchaseOrders(storeId);
    return { success: true, data };
  }

  async getPurchaseOrderById(user, storeIdParam, id) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await purchasesRepository.getPurchaseOrderById(storeId, id);
    if (!data) throw new AppError("Purchase order not found", 404);
    return { success: true, data };
  }

  async createPurchaseOrder(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);

    const { supplierId, items } = payload;
    if (!supplierId) {
      throw new AppError("Supplier selection is required for inward purchase", 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Purchase order must contain at least one product item", 400);
    }

    // Validate items
    for (const item of items) {
      if (!item.productId) throw new AppError("Product selection is required for line items", 400);
      if (!item.quantity || item.quantity <= 0) throw new AppError("Quantity must be greater than 0", 400);
      if (item.costPrice === undefined || item.costPrice < 0) throw new AppError("Valid cost price is required", 400);
      if (item.sellingPrice === undefined || item.sellingPrice < 0) throw new AppError("Valid selling price is required", 400);
    }

    const data = await purchasesRepository.createPurchaseOrderTransaction(storeId, payload);
    return { success: true, data, message: "Inward purchase order & stock batches created successfully" };
  }

  // ── Batches ──
  async getStoreBatches(user, storeIdParam, productId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await purchasesRepository.getStoreBatches(storeId, productId);
    return { success: true, data };
  }
}

export const purchasesService = new PurchasesService();
