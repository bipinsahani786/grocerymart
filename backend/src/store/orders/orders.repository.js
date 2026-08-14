import { prisma } from "../../../config/prisma.js";

const orderInclude = {
  store: { select: { id: true, name: true, address: true, phone: true, gstin: true } },
  items: { include: { product: true, variant: true } },
  payment: true,
  bill: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
  staff: { select: { id: true, name: true, email: true, phone: true } },
};

/**
 * Single Responsibility: Database access and query operations for orders, pickup, and bills.
 */
export class OrdersRepository {
  get client() {
    return prisma;
  }

  async runTransaction(action) {
    return await prisma.$transaction(action);
  }

  async orders(storeId, filters = {}) {
    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const skip = (page - 1) * limit;

    const where = { storeId };

    if (filters.type && filters.type !== "All") {
      where.type = filters.type;
    }

    if (filters.status && filters.status !== "All") {
      if (filters.status === "ACTIVE") {
        where.status = {
          notIn: ["DELIVERED", "CANCELLED", "REFUNDED", "COLLECTED", "COMPLETED"],
        };
      } else {
        where.status = filters.status;
      }
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(storeId, id) {
    return await prisma.order.findFirst({
      where: { id, storeId },
      include: orderInclude,
    });
  }

  async updateBillPdfUrl(orderId, pdfUrl) {
    return await prisma.bill.updateMany({
      where: { orderId },
      data: { pdfUrl },
    });
  }

  async updateOrderStatus(storeId, id, status) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
  }

  async findUserById(id, db = prisma) {
    return await db.user.findUnique({ where: { id } }).catch(() => null);
  }

  async findUserByPhone(phone, db = prisma) {
    return await db.user.findUnique({ where: { phone } }).catch(() => null);
  }

  async createCustomerUser(data, db = prisma) {
    return await db.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        status: "active",
        role: {
          create: {
            roleName: "customer",
            role: "CUSTOMER",
          },
        },
      },
    });
  }

  async findStoreStaffById(id, db = prisma) {
    return await db.storeStaff.findFirst({ where: { id } });
  }

  async findProductWithInventory(productId, storeId, db = prisma) {
    return await db.product.findFirst({
      where: { id: productId, storeId },
      include: { inventory: true },
    });
  }

  async decrementInventoryStock(inventoryId, qty, db = prisma) {
    return await db.storeInventory.update({
      where: { id: inventoryId },
      data: { quantity: { decrement: qty } },
    });
  }

  async createOrderWithRelations(orderPayload, db = prisma) {
    return await db.order.create({
      data: orderPayload,
    });
  }

  async createBill(billPayload, db = prisma) {
    return await db.bill.create({
      data: billPayload,
    });
  }

  async updateCustomerBalances(customerId, { khataDelta, totalSpentDelta, loyaltyDelta }, db = prisma) {
    const data = {};
    if (khataDelta) data.khataBalance = { increment: khataDelta };
    if (totalSpentDelta !== undefined) {
      data.totalOrders = { increment: 1 };
      data.totalSpent = { increment: totalSpentDelta };
      data.loyaltyPoints = { increment: loyaltyDelta || 0 };
    }

    return await db.user.update({
      where: { id: customerId },
      data,
    }).catch(() => {});
  }

  async getOrderWithFullIncludes(id, db = prisma) {
    return await db.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  }

  async getPickupQueue(storeId) {
    return await prisma.order.findMany({
      where: {
        storeId,
        type: "CLICK_COLLECT",
        status: { in: ["PLACED", "PACKING", "PACKED", "READY_FOR_PICKUP"] },
      },
      include: orderInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  async verifyPickupPin(storeId, orderId, pin) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId, type: "CLICK_COLLECT" },
    });

    if (!order) throw new Error("Pickup order not found");
    if (order.pickupPin && order.pickupPin !== pin) {
      throw new Error("Invalid pickup verification PIN");
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: "COLLECTED" },
      include: orderInclude,
    });
  }

  async bills(storeId) {
    return await prisma.bill.findMany({
      where: { storeId },
      include: {
        order: {
          include: {
            payment: true,
            items: { include: { product: true } },
            customer: true,
            staff: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}

export const ordersRepository = new OrdersRepository();
