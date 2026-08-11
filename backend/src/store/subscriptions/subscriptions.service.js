import { subscriptionsRepository } from "./subscriptions.repository.js";
import { AppError } from "../../utils/AppError.js";
import { resolveStoreId } from "../shared.js";

export class SubscriptionsService {
  async getSubscriptions(user, storeIdParam, page, limit, search) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const result = await subscriptionsRepository.getSubscriptions(storeId, page, limit, search);
    return { success: true, ...result };
  }

  async createSubscription(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    if (!payload.name || !payload.name.trim()) throw new AppError("Subscription name is required", 400);
    if (payload.price === undefined) throw new AppError("Price is required", 400);
    const data = await subscriptionsRepository.createSubscription(storeId, payload);
    return { success: true, data, message: "Subscription plan created successfully" };
  }

  async updateSubscription(user, storeIdParam, id, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await subscriptionsRepository.updateSubscription(id, storeId, payload);
    return { success: true, data, message: "Subscription plan updated successfully" };
  }

  async deleteSubscription(user, storeIdParam, id) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await subscriptionsRepository.deleteSubscription(id, storeId);
    return { success: true, message: "Subscription plan deleted successfully" };
  }
}

export const subscriptionsService = new SubscriptionsService();
