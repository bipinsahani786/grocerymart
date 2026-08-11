import { prisma } from "../../../config/prisma.js";

export class SubscriptionsRepository {
  async getSubscriptions(storeId, page = 1, limit = 10, search = "") {
    const take = parseInt(limit) || 10;
    const skip = (Math.max(1, parseInt(page)) - 1) * take;

    const where = { storeId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.storeSubscriptionPlan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.storeSubscriptionPlan.count({ where })
    ]);

    return { data, total };
  }

  async createSubscription(storeId, data) {
    return await prisma.storeSubscriptionPlan.create({
      data: {
        storeId,
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price) || 0,
        durationDays: parseInt(data.durationDays) || 30,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
        features: Array.isArray(data.features) ? data.features : [],
      }
    });
  }

  async updateSubscription(id, storeId, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price) || 0;
    if (data.durationDays !== undefined) updateData.durationDays = parseInt(data.durationDays) || 30;
    if (data.isActive !== undefined) updateData.isActive = !!data.isActive;
    if (data.features !== undefined) updateData.features = Array.isArray(data.features) ? data.features : [];

    return await prisma.storeSubscriptionPlan.update({
      where: { id, storeId },
      data: updateData
    });
  }

  async deleteSubscription(id, storeId) {
    return await prisma.storeSubscriptionPlan.delete({
      where: { id, storeId }
    });
  }
}

export const subscriptionsRepository = new SubscriptionsRepository();
