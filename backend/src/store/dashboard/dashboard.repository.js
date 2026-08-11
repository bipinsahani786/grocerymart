import { prisma } from "../../../config/prisma.js";

const orderInclude = {
  store: { select: { id: true, name: true, address: true, phone: true, gstin: true } },
  items: { include: { product: true, variant: true } },
  payment: true,
  bill: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
  staff: { select: { id: true, name: true, email: true, phone: true } },
};

export class DashboardRepository {
  async dashboard(storeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, revenueTodayResult, products, lowStock, pickupQueue, staff, store] = await Promise.all([
      prisma.order.count({ where: { storeId, createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { storeId, createdAt: { gte: today }, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.storeInventory.count({
        where: { storeId, quantity: { lte: 10 } },
      }),
      prisma.order.count({
        where: { storeId, type: "CLICK_COLLECT", status: { in: ["PLACED", "PACKING", "PACKED", "READY_FOR_PICKUP"] } },
      }),
      prisma.user.count({ where: { storeId, status: "active" } }),
      prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true, address: true },
      }),
    ]);

    const recentOrders = await prisma.order.findMany({
      where: { storeId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return {
      store,
      summary: {
        ordersToday,
        revenueToday: revenueTodayResult._sum.totalAmount || 0,
        products,
        lowStock,
        pickupQueue,
        staff,
      },
      recentOrders,
    };
  }

  async analytics(storeId, range) {
    let dateFilter = undefined;
    if (range) {
      const now = new Date();
      if (range === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateFilter = { gte: today };
      } else if (range === "weekly") {
        const weekly = new Date();
        weekly.setDate(now.getDate() - 7);
        dateFilter = { gte: weekly };
      } else if (range === "monthly") {
        const monthly = new Date();
        monthly.setDate(now.getDate() - 30);
        dateFilter = { gte: monthly };
      } else if (range === "yearly") {
        const yearly = new Date();
        yearly.setDate(now.getDate() - 365);
        dateFilter = { gte: yearly };
      }
    }

    const [paymentMethods, topProducts, hourly, slowProducts] = await Promise.all([
      prisma.payment.groupBy({
        by: ["method"],
        where: { 
          order: { 
            storeId,
            ...(dateFilter ? { createdAt: dateFilter } : {})
          } 
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.product.findMany({
        where: { storeId },
        orderBy: { salesCount: "desc" },
        take: 10,
        include: { inventory: true, category: true },
      }),
      prisma.order.findMany({
        where: { 
          storeId,
          ...(dateFilter ? { createdAt: dateFilter } : {})
        },
        select: { 
          id: true,
          orderNumber: true,
          createdAt: true, 
          totalAmount: true, 
          status: true,
          type: true,
          customer: {
            select: { name: true }
          },
          staff: {
            select: { name: true }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.product.findMany({
        where: { storeId },
        orderBy: { salesCount: "asc" },
        take: 5,
        include: { inventory: true },
      }),
    ]);

    return { paymentMethods, topProducts, hourly, slowProducts };
  }
}

export const dashboardRepository = new DashboardRepository();
