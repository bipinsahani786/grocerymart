import { prisma } from "../../../config/prisma.js";

export class CustomerOffersRepository {
  async getActiveOffers(storeId) {
    const now = new Date();
    const where = {
      isActive: true,
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    };

    if (storeId) {
      where.storeId = storeId;
    }

    let offers = await prisma.storeOffer.findMany({
      where,
      orderBy: { minOrderValue: "asc" }
    });

    // If no offers found for specific storeId, fallback to any active store's offers so customer always sees available promotions
    if (offers.length === 0 && storeId) {
      offers = await prisma.storeOffer.findMany({
        where: {
          isActive: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        },
        orderBy: { minOrderValue: "asc" }
      });
    }

    return offers;
  }

  async findOfferByCode(code, storeId) {
    const normalizedCode = String(code || "").trim().toUpperCase();
    const now = new Date();

    const where = {
      code: { equals: normalizedCode, mode: "insensitive" },
      isActive: true,
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    };

    if (storeId) {
      where.storeId = storeId;
    }

    let offer = await prisma.storeOffer.findFirst({ where });

    // Fallback search across any store if not found in specific store
    if (!offer && storeId) {
      offer = await prisma.storeOffer.findFirst({
        where: {
          code: { equals: normalizedCode, mode: "insensitive" },
          isActive: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      });
    }

    return offer;
  }
}

export const customerOffersRepository = new CustomerOffersRepository();
