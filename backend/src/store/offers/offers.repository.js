import { prisma } from "../../../config/prisma.js";

export class OffersRepository {
  async getOffers(storeId, page = 1, limit = 10, search = "") {
    const take = parseInt(limit) || 10;
    const skip = (Math.max(1, parseInt(page)) - 1) * take;

    const where = { storeId };
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.storeOffer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.storeOffer.count({ where })
    ]);

    return { data, total };
  }

  async createOffer(storeId, data) {
    return await prisma.storeOffer.create({
      data: {
        storeId,
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue) || 0,
        minOrderValue: parseFloat(data.minOrderValue) || 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      }
    });
  }

  async updateOffer(id, storeId, data) {
    const updateData = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue) || 0;
    if (data.minOrderValue !== undefined) updateData.minOrderValue = parseFloat(data.minOrderValue) || 0;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = !!data.isActive;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;

    return await prisma.storeOffer.update({
      where: { id, storeId },
      data: updateData
    });
  }

  async deleteOffer(id, storeId) {
    return await prisma.storeOffer.delete({
      where: { id, storeId }
    });
  }
}

export const offersRepository = new OffersRepository();
