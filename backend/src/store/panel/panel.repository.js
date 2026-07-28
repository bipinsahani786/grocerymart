import { prisma } from "../../../config/prisma.js";

const productInclude = {
  category: true,
  inventory: true,
};

const orderInclude = {
  items: { include: { product: true, variant: true } },
  payment: true,
  bill: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
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

  async getStoreSettings(storeId) {
    return await prisma.store.findUnique({
      where: { id: storeId },
      include: { manager: true },
    });
  }

  async updateStoreSettings(storeId, data) {
    return await prisma.store.update({
      where: { id: storeId },
      data,
      include: { manager: true },
    });
  }

  async dashboard(storeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, revenueTodayResult, products, lowStock, pickupQueue, staff] = await Promise.all([
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
        revenueToday: revenueTodayResult._sum.totalAmount || 0,
        products,
        lowStock,
        pickupQueue,
        staff,
      },
      recentOrders,
    };
  }

  // ── Categories ──
  async getCategories(storeId) {
    return await prisma.category.findMany({
      where: { storeId },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  async createCategory(storeId, data) {
    return await prisma.category.create({
      data: {
        storeId,
        name: data.name,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
      },
    });
  }

  async updateCategory(id, storeId, data) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: parseInt(data.sortOrder) } : {}),
      },
    });
  }

  async deleteCategory(id, storeId) {
    return await prisma.category.delete({
      where: { id },
    });
  }

  // ── Products & Inventory ──
  async products(storeId, q = "") {
    return await prisma.product.findMany({
      where: {
        storeId,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
                { barcode: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async createProduct(storeId, payload) {
    return await prisma.$transaction(async (tx) => {
      let categoryId = payload.categoryId;

      if (!categoryId && payload.categoryName) {
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
          productType: payload.productType || payload.type || "simple",
          unit: payload.unit || "pcs",
          basePrice: payload.basePrice !== undefined ? parseFloat(payload.basePrice) : parseFloat(payload.sellingPrice || 0),
          mrp: payload.mrp ? parseFloat(payload.mrp) : null,
          costPrice: payload.costPrice ? parseFloat(payload.costPrice) : null,
          hsnCode: payload.hsnCode || null,
          imageUrls: payload.imageUrls || [],
          showOnApp: payload.showOnApp !== undefined ? payload.showOnApp : true,
          showOnPOS: payload.showOnPOS !== undefined ? payload.showOnPOS : true,
          availableForDelivery: payload.availableForDelivery !== undefined ? payload.availableForDelivery : true,
          availableForClickCollect: payload.availableForClickCollect !== undefined ? payload.availableForClickCollect : true,
          inventory: {
            create: {
              storeId,
              quantity: payload.quantity !== undefined ? parseInt(payload.quantity) : 0,
              lowStockAt: payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : 10,
            },
          },
        },
        include: productInclude,
      });

      return product;
    });
  }

  async adjustInventory(storeId, productId, delta) {
    const inv = await prisma.storeInventory.findFirst({
      where: { storeId, productId },
    });

    if (inv) {
      return await prisma.storeInventory.update({
        where: { id: inv.id },
        data: { quantity: { increment: parseInt(delta) } },
        include: { product: true },
      });
    } else {
      return await prisma.storeInventory.create({
        data: {
          storeId,
          productId,
          quantity: Math.max(parseInt(delta), 0),
        },
        include: { product: true },
      });
    }
  }

  async updateProduct(storeId, productId, payload) {
    return await prisma.$transaction(async (tx) => {
      let categoryId = payload.categoryId;

      if (!categoryId && payload.categoryName) {
        const category = await tx.category.upsert({
          where: { storeId_name: { storeId, name: payload.categoryName } },
          update: {},
          create: { storeId, name: payload.categoryName },
        });
        categoryId = category.id;
      }

      const productData = {
        ...(payload.name ? { name: payload.name } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
        ...(payload.barcode !== undefined ? { barcode: payload.barcode } : {}),
        ...(payload.brand !== undefined ? { brand: payload.brand } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.productType !== undefined ? { productType: payload.productType } : {}),
        ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
        ...(payload.basePrice !== undefined ? { basePrice: parseFloat(payload.basePrice) } : {}),
        ...(payload.mrp !== undefined ? { mrp: payload.mrp ? parseFloat(payload.mrp) : null } : {}),
        ...(payload.imageUrls !== undefined ? { imageUrls: payload.imageUrls } : {}),
        ...(payload.showOnApp !== undefined ? { showOnApp: payload.showOnApp } : {}),
        ...(payload.showOnPOS !== undefined ? { showOnPOS: payload.showOnPOS } : {}),
      };

      const product = await tx.product.update({
        where: { id: productId },
        data: productData,
        include: productInclude,
      });

      if (payload.quantity !== undefined || payload.lowStockAlert !== undefined) {
        const inv = await tx.storeInventory.findFirst({
          where: { storeId, productId },
        });

        if (inv) {
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              ...(payload.quantity !== undefined ? { quantity: parseInt(payload.quantity) } : {}),
              ...(payload.lowStockAlert !== undefined ? { lowStockAt: parseInt(payload.lowStockAlert) } : {}),
            },
          });
        } else {
          await tx.storeInventory.create({
            data: {
              storeId,
              productId,
              quantity: payload.quantity !== undefined ? parseInt(payload.quantity) : 0,
              lowStockAt: payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : 10,
            },
          });
        }
      }

      return product;
    });
  }

  async deleteProduct(storeId, productId) {
    return await prisma.product.delete({
      where: { id: productId },
    });
  }

  // ── Import Admin Master Data ──
  async importMasterCategories(storeId) {
    const masterCategories = await prisma.masterCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    let importedCount = 0;
    for (const mc of masterCategories) {
      const existing = await prisma.category.findUnique({
        where: { storeId_name: { storeId, name: mc.name } },
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            storeId,
            name: mc.name,
            imageUrl: mc.imageUrl || null,
            sortOrder: mc.sortOrder || 0,
          },
        });
        importedCount++;
      }
    }

    return { importedCount, totalMaster: masterCategories.length };
  }

  async importMasterProducts(storeId) {
    const masterProducts = await prisma.masterProduct.findMany({
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    let importedCount = 0;
    for (const mp of masterProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          storeId,
          OR: [
            { name: mp.name },
            ...(mp.sku ? [{ sku: mp.sku }] : []),
            ...(mp.barcode ? [{ barcode: mp.barcode }] : []),
          ],
        },
      });

      if (!existingProduct) {
        let categoryId = null;
        if (mp.category) {
          const cat = await prisma.category.upsert({
            where: { storeId_name: { storeId, name: mp.category.name } },
            update: {},
            create: {
              storeId,
              name: mp.category.name,
              imageUrl: mp.category.imageUrl || null,
              sortOrder: mp.category.sortOrder || 0,
            },
          });
          categoryId = cat.id;
        }

        await prisma.product.create({
          data: {
            storeId,
            categoryId,
            name: mp.name,
            sku: mp.sku || null,
            barcode: mp.barcode || null,
            brand: mp.brand || null,
            description: mp.description || null,
            productType: mp.productType || "simple",
            unit: mp.unit || "pcs",
            basePrice: mp.basePrice || 0,
            mrp: mp.mrp || null,
            imageUrls: mp.imageUrls || [],
            showOnApp: true,
            showOnPOS: true,
            inventory: {
              create: {
                storeId,
                quantity: 20,
                lowStockAt: 5,
              },
            },
          },
        });
        importedCount++;
      }
    }

    return { importedCount, totalMaster: masterProducts.length };
  }

  // ── Orders ──
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

  async getOrderById(storeId, id) {
    return await prisma.order.findFirst({
      where: { id, storeId },
      include: orderInclude,
    });
  }

  async updateOrderStatus(storeId, id, status) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
  }

  // ── Click & Collect Pickup ──
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

  // ── Bills & Receipts ──
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

  // ── Customers ──
  async getCustomers(storeId) {
    const customers = await prisma.user.findMany({
      where: {
        orders: {
          some: { storeId },
        },
      },
      include: {
        orders: {
          where: { storeId },
          select: { totalAmount: true, createdAt: true, status: true },
        },
      },
    });

    return customers.map((c) => {
      const validOrders = c.orders.filter((o) => o.status !== "CANCELLED");
      const totalSpent = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: c.id,
        name: c.name || "Customer",
        email: c.email || "",
        phone: c.phone || "",
        loyaltyPoints: c.loyaltyPoints || 0,
        totalOrders: validOrders.length,
        totalSpent,
        createdAt: c.createdAt,
      };
    });
  }

  // ── Staff ──
  async staff(storeId) {
    const staffMembers = await prisma.user.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pin: true,
        avatar: true,
        status: true,
        role: true,
        createdAt: true,
        shifts: { orderBy: { createdAt: "desc" } },
        staffOrders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return staffMembers.map((member) => {
      const totalOrders = member.staffOrders.length;
      const totalShiftOrders = member.shifts.reduce((sum, s) => sum + (s.ordersHandled || 0), 0);
      const processedOrders = Math.max(totalOrders, totalShiftOrders);

      let avgHandlingMinutes = 0;
      if (member.staffOrders.length > 0) {
        const totalDurationMs = member.staffOrders.reduce((sum, order) => {
          const diff = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
          return sum + (diff > 0 ? diff : 180000);
        }, 0);
        avgHandlingMinutes = Math.max(1, Math.round(totalDurationMs / (member.staffOrders.length * 60000)));
      }

      const completedOrders = member.staffOrders.filter(
        (o) => o.status === "DELIVERED" || o.status === "COMPLETED" || o.status === "COLLECTED"
      ).length;

      let rating = null;
      if (processedOrders > 0) {
        const successRatio = completedOrders > 0 ? completedOrders / processedOrders : 0.8;
        rating = (4.0 + successRatio * 1.0).toFixed(1);
      }

      return {
        ...member,
        performance: {
          ordersProcessed: processedOrders,
          avgPackTimeMinutes: avgHandlingMinutes,
          rating: rating,
        },
      };
    });
  }

  async createStaff(storeId, userData, roleName) {
    const roleToCreate = userData.role || roleName || "CASHIER";

    const existingUser = await prisma.user.findFirst({
      where: { phone: userData.phone },
      include: { role: true },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: userData.name,
          email: userData.email || existingUser.email,
          pin: userData.pin || existingUser.pin,
          storeId,
          status: "active",
        },
        include: { role: true, shifts: { orderBy: { createdAt: "desc" }, take: 1 } },
      });

      if (existingUser.role) {
        await prisma.userRole.update({
          where: { id: existingUser.role.id },
          data: { roleName: roleToCreate },
        });
      } else {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleName: roleToCreate,
          },
        });
      }

      if (userData.shift) {
        await prisma.staffShift.create({
          data: {
            storeId,
            staffId: existingUser.id,
            shiftName: userData.shift,
          },
        });
      }

      return updatedUser;
    }

    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email || null,
        phone: userData.phone,
        pin: userData.pin || null,
        storeId,
        status: "active",
        role: {
          create: {
            roleName: roleToCreate,
          },
        },
        shifts: userData.shift ? {
          create: {
            storeId,
            shiftName: userData.shift,
          }
        } : undefined
      },
      include: { role: true, shifts: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  }

  async toggleStaffClock(storeId, staffId) {
    const latestShift = await prisma.staffShift.findFirst({
      where: { storeId, staffId },
      orderBy: { createdAt: "desc" },
    });

    if (latestShift && !latestShift.clockOut) {
      return await prisma.staffShift.update({
        where: { id: latestShift.id },
        data: { clockOut: new Date() },
      });
    } else {
      return await prisma.staffShift.create({
        data: {
          storeId,
          staffId,
          shiftName: latestShift?.shiftName || "Morning",
          clockIn: new Date(),
        },
      });
    }
  }

  async updateStaffShift(storeId, staffId, shiftName) {
    const latestShift = await prisma.staffShift.findFirst({
      where: { storeId, staffId },
      orderBy: { createdAt: "desc" },
    });

    if (latestShift) {
      return await prisma.staffShift.update({
        where: { id: latestShift.id },
        data: { shiftName },
      });
    } else {
      return await prisma.staffShift.create({
        data: {
          storeId,
          staffId,
          shiftName,
        },
      });
    }
  }

  // ── Analytics ──
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
        select: { createdAt: true, totalAmount: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    return { paymentMethods, topProducts, hourly };
  }
}

export const storePanelRepository = new StorePanelRepository();
