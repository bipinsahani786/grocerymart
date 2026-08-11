import { offersRepository } from "./offers.repository.js";
import { AppError } from "../../utils/AppError.js";
import { resolveStoreId } from "../shared.js";

export class OffersService {
  async getOffers(user, storeIdParam, page, limit, search) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const result = await offersRepository.getOffers(storeId, page, limit, search);
    return { success: true, ...result };
  }

  async createOffer(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    if (!payload.code || !payload.code.trim()) throw new AppError("Offer code is required", 400);
    if (!payload.discountType) throw new AppError("Discount type is required", 400);
    const data = await offersRepository.createOffer(storeId, payload);
    return { success: true, data, message: "Offer coupon created successfully" };
  }

  async updateOffer(user, storeIdParam, id, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await offersRepository.updateOffer(id, storeId, payload);
    return { success: true, data, message: "Offer coupon updated successfully" };
  }

  async deleteOffer(user, storeIdParam, id) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await offersRepository.deleteOffer(id, storeId);
    return { success: true, message: "Offer coupon deleted successfully" };
  }
}

export const offersService = new OffersService();
