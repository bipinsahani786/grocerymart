import { prisma } from "../../../config/prisma.js";

export class CustomersRepository {
  async getCustomers(storeId) {
    const customers = await prisma.user.findMany({
      include: {
        orders: {
          select: { id: true, totalAmount: true, createdAt: true, status: true, orderNumber: true, type: true },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        role: true
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return customers.map((c) => {
      const validOrders = c.orders ? c.orders.filter((o) => o.status !== "CANCELLED") : [];
      const totalSpentCalculated = validOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      return {
        id: c.id,
        name: c.name || "Customer",
        email: c.email || "",
        phone: c.phone || "",
        loyaltyPoints: c.loyaltyPoints || 0,
        totalOrders: c.totalOrders || validOrders.length,
        totalSpent: c.totalSpent || totalSpentCalculated,
        khataBalance: c.khataBalance || 0,
        notes: c.notes || "",
        createdAt: c.createdAt,
        orders: c.orders || [],
      };
    });
  }

  async createCustomer(storeId, data) {
    return prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        notes: data.notes || null,
        khataBalance: data.khataBalance || 0,
        loyaltyPoints: data.loyaltyPoints || 0,
        status: "active",
        isActive: true,
        role: {
          create: {
            roleName: "customer",
            role: "CUSTOMER",
          },
        },
      },
    });
  }

  async updateCustomer(storeId, customerId, data) {
    return prisma.user.update({
      where: { id: customerId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.khataBalance !== undefined && { khataBalance: data.khataBalance }),
        ...(data.loyaltyPoints !== undefined && { loyaltyPoints: data.loyaltyPoints }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async deleteCustomer(storeId, customerId) {
    return prisma.user.delete({
      where: { id: customerId },
    }).catch(() => null);
  }
}

export const customersRepository = new CustomersRepository();
