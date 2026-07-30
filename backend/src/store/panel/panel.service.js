import { storePanelRepository } from "./panel.repository.js";
import { AppError } from "../../utils/AppError.js";

export class StorePanelService {
  async resolveStoreId(user, queryStoreId) {
    if (queryStoreId) return queryStoreId;
    const store = await storePanelRepository.getUserStore(user.id);
    if (!store) {
      // Fallback: If user is superadmin or testing, get first active store in system
      throw new AppError("No active store associated with this account.", 400);
    }
    return store.id;
  }

  async getDashboard(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.dashboard(storeId);
    return { success: true, data };
  }

  async getSettings(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.getStoreSettings(storeId);
    return { success: true, data };
  }

  async updateSettings(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateStoreSettings(storeId, payload);
    return { success: true, data, message: "Store settings updated successfully" };
  }

  async getCategories(user, storeIdParam, filters) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.getCategories(storeId, filters);
    return { success: true, data };
  }

  async createCategory(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    if (!payload.name || !payload.name.trim()) {
      throw new AppError("Category name is required", 400);
    }
    const data = await storePanelRepository.createCategory(storeId, payload);
    return { success: true, data, message: "Category created successfully" };
  }

  async updateCategory(user, storeIdParam, categoryId, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateCategory(categoryId, storeId, payload);
    return { success: true, data, message: "Category updated successfully" };
  }

  async deleteCategory(user, storeIdParam, categoryId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    await storePanelRepository.deleteCategory(categoryId, storeId);
    return { success: true, message: "Category deleted successfully" };
  }

  async getInventory(user, storeIdParam, query = "") {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.products(storeId, query);
    return { success: true, data };
  }

  async createProduct(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    if (!payload.name || !payload.name.trim()) throw new AppError("Product name is required", 400);
    const data = await storePanelRepository.createProduct(storeId, payload);
    return { success: true, data, message: "Product created in store successfully" };
  }

  async updateProduct(user, storeIdParam, productId, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateProduct(storeId, productId, payload);
    return { success: true, data, message: "Product updated successfully" };
  }

  async deleteProduct(user, storeIdParam, productId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    await storePanelRepository.deleteProduct(storeId, productId);
    return { success: true, message: "Product deleted successfully" };
  }

  async importMasterCategories(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.importMasterCategories(storeId);
    return {
      success: true,
      data,
      message: `Successfully imported ${data.importedCount} master categories into your store!`,
    };
  }

  async importMasterProducts(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.importMasterProducts(storeId);
    return {
      success: true,
      data,
      message: `Successfully imported ${data.importedCount} master products into your store catalog!`,
    };
  }

  async adjustInventory(user, storeIdParam, productId, delta) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.adjustInventory(storeId, productId, delta);
    return { success: true, data, message: "Stock level updated successfully" };
  }

  async getOrders(user, storeIdParam, filters) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.orders(storeId, filters);
    return { success: true, data };
  }

  async getOrderById(user, storeIdParam, orderId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.getOrderById(storeId, orderId);
    if (!data) throw new AppError("Order not found", 404);
    return { success: true, data };
  }

  async updateOrderStatus(user, storeIdParam, orderId, status) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateOrderStatus(storeId, orderId, status);
    return { success: true, data, message: "Order status updated" };
  }

  async getPickupQueue(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.getPickupQueue(storeId);
    return { success: true, data };
  }

  async verifyPickupPin(user, storeIdParam, orderId, pin) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.verifyPickupPin(storeId, orderId, pin);
    return { success: true, data, message: "Order picked up successfully" };
  }

  async getBills(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.bills(storeId);
    return { success: true, data };
  }

  async getCustomers(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.getCustomers(storeId);
    return { success: true, data };
  }

  async getStaff(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.staff(storeId);
    return { success: true, data };
  }

  async createStaff(user, storeIdParam, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);

    const name = payload.name?.trim();
    if (!name || name.length < 2) {
      throw new AppError("Full Name is required and must be at least 2 characters", 400);
    }

    const cleanPhone = String(payload.phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new AppError("Enter Valid phone number!", 400);
    }

    if (payload.email && payload.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email.trim())) {
        throw new AppError("Enter a valid email address", 400);
      }
    }

    const cleanPin = String(payload.pin || "").replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 4) {
      throw new AppError("Secure PIN must be exactly 4 digits", 400);
    }

    const normalizedPayload = {
      ...payload,
      name,
      phone: cleanPhone,
      email: payload.email?.trim() || null,
      pin: cleanPin,
    };

    const data = await storePanelRepository.createStaff(storeId, normalizedPayload, payload.role);
    return { success: true, data, message: "Staff member created successfully" };
  }

  async updateStaff(user, storeIdParam, staffId, payload) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateStaff(storeId, staffId, payload);
    return { success: true, data, message: "Staff member updated successfully" };
  }

  async deleteStaff(user, storeIdParam, staffId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    await storePanelRepository.deleteStaff(storeId, staffId);
    return { success: true, message: "Staff member deleted successfully" };
  }

  async toggleStaffClock(user, storeIdParam, staffId) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.toggleStaffClock(storeId, staffId);
    return { success: true, data, message: "Clock status updated" };
  }

  async updateStaffShift(user, storeIdParam, staffId, shiftName) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.updateStaffShift(storeId, staffId, shiftName);
    return { success: true, data, message: "Shift updated" };
  }

  async getAnalytics(user, storeIdParam) {
    const storeId = await this.resolveStoreId(user, storeIdParam);
    const data = await storePanelRepository.analytics(storeId);
    return { success: true, data };
  }
}

export const storePanelService = new StorePanelService();
