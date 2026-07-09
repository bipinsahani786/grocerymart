import { prisma } from "../../../config/prisma.js";

const productInclude = {
  category: true,
  inventory: true,
};

const orderInclude = {
  items: { include: { product: true } },
  payment: true,
  bill: true,
  staff: { select: { id: true, name: true, email: true, phone: true } },
};

export class StorePanelRepository {
  async getUserStore(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        managedStore: true,
        role: true,
      },
    });
    return user?.managedStore || user?.store || null;
  }

  async dashboard(storeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, revenueToday, products, lowStock, pickupQueue, staff] = await Promise.all([
      prisma.order.count({ where: { storeId, createdAt: { gte: today } } }),
      prisma.order.aggregate({ where: { storeId, createdAt: { gte: today }, status: { not: "CANCELLED" } }, _sum: { totalAmount: true } }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.storeInventory.count({ where: { storeId, quantity: { lte: prisma.storeInventory.fields.lowStockAlert } } }),
      prisma.order.count({ where: { storeId, type: "CLICK_COLLECT", status: { in: ["PLACED", "PACKING", "PACKED", "READY_FOR_PICKUP"] } } }),
      prisma.user.count({ where: { storeId, status: "active" } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      where: { storeId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return {
      summary: {
        ordersToday,
        revenueToday: revenueToday._sum.totalAmount || 0,
        products,
        lowStock,
        pickupQueue,
        staff,
      },
      recentOrders,
    };
  }

  async products(storeId, q = "") {
    return await prisma.product.findMany({
      where: {
        storeId,
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async createProduct(storeId, payload) {
    return await prisma.$transaction(async (tx) => {
      let categoryId = null;
      if (payload.categoryName) {
        const category = await tx.category.upsert({
          where: { storeId_name: { storeId, name: payload.categoryName } },
          update: {},
          create: { storeId, name: payload.categoryName },
        });
        categoryId = category.id;
      }

      const product = await tx.product.create({
        data: {
          storeId,
          categoryId,
          name: payload.name,
          sku: payload.sku || null,
          barcode: payload.barcode || null,
          brand: payload.brand || null,
          description: payload.description || null,
          type: payload.type,
          mrp: payload.mrp,
          sellingPrice: payload.sellingPrice,
          costPrice: payload.costPrice,
          taxRate: payload.taxRate,
          hsnCode: payload.hsnCode || null,
          unit: payload.unit,
          rackLocation: payload.rackLocation || null,
          expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
          showOnline: payload.showOnline,
          showPOS: payload.showPOS,
          deliveryEnabled: payload.deliveryEnabled,
          clickCollectEnabled: payload.clickCollectEnabled,
          inventory: {
            create: {
              storeId,
              quantity: payload.quantity,
              lowStockAlert: payload.lowStockAlert,
            },
          },
        },
        include: productInclude,
      });

      return product;
    });
  }

  async adjustInventory(storeId, productId, delta) {
    return await prisma.storeInventory.update({
      where: { productId },
      data: { quantity: { increment: delta } },
      include: { product: true },
    });
  }

  async orders(storeId, filters = {}) {
    return await prisma.order.findMany({
      where: {
        storeId,
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async createPosOrder(storeId, staffId, payload) {
    return await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: payload.items.map((item) => item.productId) }, storeId },
        include: { inventory: true },
      });

      const byId = new Map(products.map((product) => [product.id, product]));
      const orderItems = [];
      let subtotal = 0;
      let taxAmount = 0;

      for (const item of payload.items) {
        const product = byId.get(item.productId);
        if (!product) throw new Error("Product not found in this store");
        if (product.type !== "service") {
          const updated = await tx.storeInventory.updateMany({
            where: { productId: product.id, storeId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          });
          if (updated.count === 0) throw new Error(`Out of stock: ${product.name}`);
        }

        const lineSubtotal = product.sellingPrice * item.quantity;
        const lineTax = lineSubtotal * (product.taxRate / 100);
        subtotal += lineSubtotal;
        taxAmount += lineTax;
        orderItems.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          taxRate: product.taxRate,
          lineTotal: lineSubtotal + lineTax,
          rackLocation: product.rackLocation,
        });
      }

      const totalAmount = Math.max(subtotal + taxAmount - payload.discount, 0);
      const orderNumber = `POS-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId,
          staffId,
          type: "POS",
          status: "COMPLETED",
          customerName: payload.customerName || null,
          customerPhone: payload.customerPhone || null,
          subtotal,
          discount: payload.discount,
          taxAmount,
          totalAmount,
          notes: payload.notes || null,
          items: { create: orderItems },
          payment: {
            create: {
              method: payload.paymentMethod,
              status: "SUCCESS",
              amount: totalAmount,
            },
          },
          bill: {
            create: {
              storeId,
              billNumber: `BILL-${Date.now()}`,
              type: "RECEIPT",
            },
          },
        },
        include: orderInclude,
      });

      await tx.product.updateMany({
        where: { id: { in: products.map((product) => product.id) } },
        data: { salesCount: { increment: 1 } },
      });

      return order;
    });
  }

  async updateOrderStatus(storeId, id, status) {
    return await prisma.order.update({
      where: { id, storeId },
      data: { status },
      include: orderInclude,
    });
  }

  async bills(storeId) {
    return await prisma.bill.findMany({
      where: { storeId },
      include: { order: { include: { payment: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async staff(storeId) {
    return await prisma.user.findMany({
      where: { storeId },
      include: { role: true, shifts: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createStaff(storeId, userData, roleName) {
    return await prisma.user.create({
      data: {
        ...userData,
        storeId,
        role: { create: { roleName } },
      },
      include: { role: true },
    });
  }

  async analytics(storeId) {
    const [paymentMethods, topProducts, hourly] = await Promise.all([
      prisma.payment.groupBy({
        by: ["method"],
        where: { order: { storeId } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.product.findMany({
        where: { storeId },
        orderBy: { salesCount: "desc" },
        take: 10,
        include: { inventory: true },
      }),
      prisma.order.findMany({
        where: { storeId },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return { paymentMethods, topProducts, hourly };
  }
}

export const storePanelRepository = new StorePanelRepository();
