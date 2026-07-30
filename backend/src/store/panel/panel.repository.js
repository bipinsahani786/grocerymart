import { prisma } from "../../../config/prisma.js";

const productInclude = {
  category: true,
  inventory: {
    include: {
      rack: true,
    },
  },
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
  async getCategories(storeId, filters = {}) {
    const { page, limit, search, parentId, all } = filters;

    // If 'all' flag is provided, return all categories (used for dropdowns)
    if (all === 'true') {
      const data = await prisma.category.findMany({
        where: { storeId },
        include: { _count: { select: { products: true } }, children: true },
        orderBy: { sortOrder: "asc" },
      });
      return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (parentId !== undefined) {
      if (parentId === 'not_null') {
        where.parentId = { not: null };
        where.parent = { parentId: null };
      } else {
        where.parentId = parentId === 'null' || !parentId ? null : parentId;
      }
    }

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } }, children: true, parent: true },
        orderBy: { sortOrder: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.category.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    };
  }

  async createCategory(storeId, data) {
    return await prisma.category.create({
      data: {
        storeId,
        name: data.name,
        parentId: data.parentId || null,
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
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
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

      let rackId = null;
      if (payload.rackLocation && payload.rackLocation.trim()) {
        let rack = await tx.rack.findFirst({
          where: { storeId, name: payload.rackLocation.trim() }
        });
        if (!rack) {
          rack = await tx.rack.create({
            data: { storeId, name: payload.rackLocation.trim() }
          });
        }
        rackId = rack.id;
      }

      const product = await tx.product.create({
        data: {
          store: { connect: { id: storeId } },
          category: { connect: { id: categoryId } },
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
          showOnApp: payload.showOnApp !== undefined ? payload.showOnApp : (payload.showOnline !== undefined ? payload.showOnline : true),
          showOnPOS: payload.showOnPOS !== undefined ? payload.showOnPOS : (payload.showPOS !== undefined ? payload.showPOS : true),
          availableForDelivery: payload.availableForDelivery !== undefined ? payload.availableForDelivery : (payload.deliveryEnabled !== undefined ? payload.deliveryEnabled : true),
          availableForClickCollect: payload.availableForClickCollect !== undefined ? payload.availableForClickCollect : (payload.clickCollectEnabled !== undefined ? payload.clickCollectEnabled : true),
          inventory: {
            create: {
              store: { connect: { id: storeId } },
              quantity: payload.quantity !== undefined ? parseInt(payload.quantity) : (payload.stock !== undefined ? parseInt(payload.stock) : 0),
              lowStockAt: payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : (payload.lowStockAt !== undefined ? parseInt(payload.lowStockAt) : 10),
              ...(rackId ? { rack: { connect: { id: rackId } } } : {}),
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

    const deltaInt = parseInt(delta);
    const currentQty = inv?.quantity || 0;

    if (deltaInt < 0 && (currentQty + deltaInt) < 0) {
      throw new Error(`Insufficient stock. Current stock is ${currentQty}, cannot deduct ${Math.abs(deltaInt)} items.`);
    }

    if (inv) {
      return await prisma.storeInventory.update({
        where: { id: inv.id },
        data: { quantity: currentQty + deltaInt },
        include: { product: true },
      });
    } else {
      if (deltaInt < 0) {
        throw new Error(`Product has no inventory record. Cannot perform negative stock adjustment.`);
      }
      return await prisma.storeInventory.create({
        data: {
          storeId,
          productId,
          quantity: deltaInt,
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
        ...(payload.productType !== undefined || payload.type !== undefined ? { productType: payload.productType || payload.type } : {}),
        ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
        ...(payload.basePrice !== undefined || payload.sellingPrice !== undefined ? { basePrice: parseFloat(payload.sellingPrice ?? payload.basePrice) } : {}),
        ...(payload.mrp !== undefined ? { mrp: payload.mrp !== null && payload.mrp !== '' ? parseFloat(payload.mrp) : null } : {}),
        ...(payload.costPrice !== undefined ? { costPrice: payload.costPrice !== null && payload.costPrice !== '' ? parseFloat(payload.costPrice) : null } : {}),
        ...(payload.hsnCode !== undefined ? { hsnCode: payload.hsnCode } : {}),
        ...(payload.imageUrls !== undefined ? { imageUrls: payload.imageUrls } : {}),
        ...(payload.showOnApp !== undefined || payload.showOnline !== undefined ? { showOnApp: payload.showOnApp ?? payload.showOnline } : {}),
        ...(payload.showOnPOS !== undefined || payload.showPOS !== undefined ? { showOnPOS: payload.showOnPOS ?? payload.showPOS } : {}),
        ...(payload.availableForDelivery !== undefined || payload.deliveryEnabled !== undefined ? { availableForDelivery: payload.availableForDelivery ?? payload.deliveryEnabled } : {}),
        ...(payload.availableForClickCollect !== undefined || payload.clickCollectEnabled !== undefined ? { availableForClickCollect: payload.availableForClickCollect ?? payload.clickCollectEnabled } : {}),
      };

      const product = await tx.product.update({
        where: { id: productId },
        data: productData,
        include: productInclude,
      });

      let rackId = undefined;
      if (payload.rackLocation !== undefined) {
        if (payload.rackLocation && payload.rackLocation.trim()) {
          let rack = await tx.rack.findFirst({
            where: { storeId, name: payload.rackLocation.trim() }
          });
          if (!rack) {
            rack = await tx.rack.create({
              data: { storeId, name: payload.rackLocation.trim() }
            });
          }
          rackId = rack.id;
        } else {
          rackId = null;
        }
      }

      if (payload.quantity !== undefined || payload.stock !== undefined || payload.lowStockAlert !== undefined || payload.lowStockAt !== undefined || rackId !== undefined) {
        const inv = await tx.storeInventory.findFirst({
          where: { storeId, productId },
        });

        const qtyVal = payload.quantity !== undefined ? parseInt(payload.quantity) : (payload.stock !== undefined ? parseInt(payload.stock) : undefined);
        const lowStockVal = payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : (payload.lowStockAt !== undefined ? parseInt(payload.lowStockAt) : undefined);

        if (inv) {
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              ...(qtyVal !== undefined ? { quantity: qtyVal } : {}),
              ...(lowStockVal !== undefined ? { lowStockAt: lowStockVal } : {}),
              ...(rackId !== undefined ? { rackId } : {}),
            },
          });
        } else {
          await tx.storeInventory.create({
            data: {
              storeId,
              productId,
              quantity: qtyVal ?? 0,
              lowStockAt: lowStockVal ?? 10,
              ...(rackId ? { rackId } : {}),
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
      include: { parent: true }
    });

    let importedCount = 0;
    
    // First pass: create all categories (without parentId initially)
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

    // Second pass: link parent categories
    for (const mc of masterCategories) {
      if (mc.parentId && mc.parent) {
        const localParent = await prisma.category.findUnique({
          where: { storeId_name: { storeId, name: mc.parent.name } }
        });
        
        if (localParent) {
          await prisma.category.update({
            where: { storeId_name: { storeId, name: mc.name } },
            data: { parentId: localParent.id }
          });
        }
      }
    }

    return { importedCount, totalMaster: masterCategories.length };
  }

  async importMasterProducts(storeId) {
    const masterProducts = await prisma.masterProduct.findMany({
      include: { category: true, variants: true },
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
            isActive: mp.isActive ?? true,
            taxClassId: mp.taxClassId || null,
            hsnCode: mp.hsnCode || null,
            masterProductId: mp.id,
            variants: mp.variants?.length ? {
              create: mp.variants.map((v) => ({
                name: v.name,
                barcode: v.barcode,
                price: v.price,
                mrp: v.mrp,
                imageUrl: v.imageUrl,
              }))
            } : undefined,
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
    const storeStaffList = await prisma.storeStaff.findMany({
      where: { storeId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return storeStaffList.map((member) => ({
      id: member.id,
      name: member.name || member.user?.name || "Staff Member",
      email: member.email || member.user?.email || "",
      phone: member.phone || member.user?.phone || "",
      role: member.role || "CASHIER",
      shift: member.shift || "General",
      status: member.isActive ? "active" : "inactive",
      createdAt: member.createdAt,
      performance: {
        ordersProcessed: 0,
        avgPackTimeMinutes: 0,
        rating: "5.0",
      },
    }));
  }

  async createStaff(storeId, userData) {
    let userId = null;
    if (userData.phone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: userData.phone },
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    return await prisma.storeStaff.create({
      data: {
        storeId,
        userId,
        name: userData.name,
        email: userData.email || null,
        phone: userData.phone,
        role: userData.role || "CASHIER",
        shift: userData.shift || "General",
        isActive: true,
      },
    });
  }

  async updateStaff(storeId, staffId, userData) {
    return await prisma.storeStaff.update({
      where: { id: staffId },
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        shift: userData.shift,
        isActive: userData.isActive !== undefined ? userData.isActive : (userData.status === "active"),
      },
    });
  }

  async deleteStaff(storeId, staffId) {
    return await prisma.storeStaff.delete({
      where: { id: staffId },
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
