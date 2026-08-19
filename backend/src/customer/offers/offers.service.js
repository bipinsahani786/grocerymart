import { customerOffersRepository } from "./offers.repository.js";
import { customerStoresRepository } from "../stores/stores.repository.js";
import { AppError } from "../../utils/AppError.js";

export class CustomerOffersService {
  async getOffers(storeId, pincode) {
    let targetStoreId = storeId;
    if (!targetStoreId && pincode) {
      const matchedStore = await customerStoresRepository.findStoreByPincode(pincode);
      if (matchedStore) {
        targetStoreId = matchedStore.id;
      }
    }

    const offers = await customerOffersRepository.getActiveOffers(targetStoreId);

    // Deduplicate coupons by normalized code so customer gets clean unique voucher list
    const uniqueMap = new Map();
    for (const offer of offers) {
      const codeKey = String(offer.code).toUpperCase().trim();
      if (!uniqueMap.has(codeKey)) {
        uniqueMap.set(codeKey, {
          id: offer.id,
          code: offer.code,
          description: offer.description,
          discountType: offer.discountType, // 'FLAT' | 'PERCENT'
          discountValue: offer.discountValue,
          minOrderValue: offer.minOrderValue || 0,
          maxDiscount: offer.maxDiscount || null,
          endDate: offer.endDate,
        });
      }
    }

    return Array.from(uniqueMap.values());
  }

  async validateCoupon(code, subtotal = 0, storeId, pincode) {
    if (!code || !code.trim()) {
      throw new AppError("Coupon code is required", 400);
    }

    let targetStoreId = storeId;
    if (!targetStoreId && pincode) {
      const matchedStore = await customerStoresRepository.findStoreByPincode(pincode);
      if (matchedStore) {
        targetStoreId = matchedStore.id;
      }
    }

    const offer = await customerOffersRepository.findOfferByCode(code, targetStoreId);
    if (!offer) {
      throw new AppError(`Invalid or expired coupon code: ${code.trim().toUpperCase()}`, 404);
    }

    const numSubtotal = parseFloat(subtotal) || 0;
    if (offer.minOrderValue && numSubtotal < offer.minOrderValue) {
      const shortfall = offer.minOrderValue - numSubtotal;
      throw new AppError(
        `Coupon '${offer.code}' requires a minimum order of ₹${offer.minOrderValue.toFixed(0)}. Add ₹${shortfall.toFixed(0)} more to apply!`,
        400
      );
    }

    let discountAmount = 0;
    if (offer.discountType === "PERCENT") {
      discountAmount = (numSubtotal * offer.discountValue) / 100;
      if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
        discountAmount = offer.maxDiscount;
      }
    } else {
      // FLAT discount
      discountAmount = Math.min(offer.discountValue, numSubtotal);
    }

    return {
      valid: true,
      coupon: {
        id: offer.id,
        code: offer.code,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        minOrderValue: offer.minOrderValue || 0,
        maxDiscount: offer.maxDiscount || null,
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
      message: `Coupon '${offer.code}' applied! Saved ₹${Math.round(discountAmount)}.`,
    };
  }
}

export const customerOffersService = new CustomerOffersService();
