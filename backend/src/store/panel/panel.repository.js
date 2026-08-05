import { prisma } from "../../../config/prisma.js";
import { normalizeStaffRole } from "../../utils/roleUtils.js";

const productInclude = {
  category: true,
  inventory: {
    include: {
      rack: true,
    },
  },
  taxClass: {
    include: {
      rates: {
        include: {
          components: true,
        },
      },
    },
  },
};

const orderInclude = {
  store: { select: { id: true, name: true, address: true, phone: true, gstin: true } },
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
        staffStore: { include: { store: true } },
      },
    });
    if (!user) return null;
    if (user.managedStore) return user.managedStore;
    if (user.store) return user.store;
    if (user.staffStore && user.staffStore.length > 0) {
      return user.staffStore[0].store;
    }
    return null;
  }

  async getFirstStore() {
    return await prisma.store.findFirst();
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

  // ====== Taxes ======
  async getTaxes() {
    return await prisma.taxClass.findMany({
      where: { isActive: true },
      include: {
        rates: {
          include: { components: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ====== Categories ──
  async getCategories(storeId, filters = {}) {
    const { page, limit, search, parentId, all } = filters;

    // Check if store has 0 categories; if so, auto-import from Master Categories
    const categoryCount = await prisma.category.count({ where: { storeId } });
    if (categoryCount === 0) {
      await this.importMasterCategories(storeId);
    }

    // If 'all' flag is provided, return all categories (used for dropdowns & filters)
    if (all === 'true' || all === true) {
      const data = await prisma.category.findMany({
        where: { storeId },
        include: { _count: { select: { products: true } }, children: true, parent: true },
        orderBy: { sortOrder: "asc" },
      });
      return { data, meta: { total: data.length, page: 1, limit: Math.max(1, data.length), totalPages: 1 } };
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

    if (parentId !== undefined && parentId !== '' && parentId !== 'all') {
      if (parentId === 'not_null') {
        where.parentId = { not: null };
      } else if (parentId === 'null') {
        where.parentId = null;
      } else {
        where.parentId = parentId;
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
        totalPages: Math.ceil(total / limitNum) || 1,
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
          ...(payload.taxClassId ? { taxClass: { connect: { id: payload.taxClassId } } } : {}),
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
        ...(payload.taxClassId !== undefined ? { taxClassId: payload.taxClassId } : {}),
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

  async getMasterCatalog() {
    return await prisma.masterProduct.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async importMasterProducts(storeId, productIds = []) {
    if (!productIds || productIds.length === 0) {
      return { importedCount: 0, totalMaster: 0 };
    }

    const masterProducts = await prisma.masterProduct.findMany({
      where: {
        id: { in: productIds }
      },
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
                quantity: 0,
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
    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const skip = (page - 1) * limit;

    const where = {
      storeId,
    };

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

  async createPosOrder(storeId, payload, staffUserId) {
    const { customerName, customerPhone, customerId, staffId, discount = 0, paymentMethod = "CASH", notes, items } = payload;

    return await prisma.$transaction(async (tx) => {
      // 1. Resolve Customer (StoreCustomer & User mapping)
      let finalCustomerId = null;
      let targetStoreCustomer = null;
      let targetPhone = customerPhone?.trim() || null;
      let targetName = customerName?.trim() || "POS Customer";

      // If customerId is supplied from frontend (can be StoreCustomer.id or User.id)
      if (customerId) {
        targetStoreCustomer = await tx.storeCustomer.findFirst({
          where: { id: customerId, storeId },
        });

        if (!targetStoreCustomer) {
          targetStoreCustomer = await tx.storeCustomer.findUnique({
            where: { id: customerId },
          }).catch(() => null);
        }

        if (targetStoreCustomer) {
          targetPhone = targetStoreCustomer.phone || targetPhone;
          targetName = targetStoreCustomer.name || targetName;
        } else {
          const directUser = await tx.user.findUnique({ where: { id: customerId } }).catch(() => null);
          if (directUser) {
            finalCustomerId = directUser.id;
            targetPhone = directUser.phone || targetPhone;
            targetName = directUser.name || targetName;
          }
        }
      }

      // If phone is available, resolve or create User and StoreCustomer records
      if (targetPhone) {
        let userObj = await tx.user.findUnique({ where: { phone: targetPhone } });
        if (!userObj) {
          userObj = await tx.user.create({
            data: {
              phone: targetPhone,
              name: targetName,
              status: "active",
            },
          });
        }
        finalCustomerId = userObj.id;

        // Ensure StoreCustomer record exists for this store
        if (!targetStoreCustomer) {
          targetStoreCustomer = await tx.storeCustomer.findFirst({
            where: { storeId, phone: targetPhone },
          });

          if (!targetStoreCustomer) {
            targetStoreCustomer = await tx.storeCustomer.create({
              data: {
                storeId,
                name: targetName,
                phone: targetPhone,
              },
            });
          }
        }
      }

      // 2. Resolve Staff / Cashier (StoreStaff -> User mapping)
      let finalStaffId = staffUserId || null;
      const targetStaffId = staffId || staffUserId;

      if (targetStaffId) {
        const storeStaffObj = await tx.storeStaff.findFirst({
          where: { id: targetStaffId },
          include: { user: true },
        }).catch(() => null);

        if (storeStaffObj) {
          if (storeStaffObj.userId) {
            finalStaffId = storeStaffObj.userId;
          } else if (storeStaffObj.phone) {
            let staffUser = await tx.user.findUnique({ where: { phone: storeStaffObj.phone } });
            if (!staffUser) {
              staffUser = await tx.user.create({
                data: {
                  phone: storeStaffObj.phone,
                  name: storeStaffObj.name || "Cashier Staff",
                  email: storeStaffObj.email || undefined,
                  status: "active",
                },
              });
              await tx.storeStaff.update({
                where: { id: storeStaffObj.id },
                data: { userId: staffUser.id },
              }).catch(() => {});
            }
            finalStaffId = staffUser.id;
          }
        } else {
          const directStaffUser = await tx.user.findUnique({ where: { id: targetStaffId } }).catch(() => null);
          if (directStaffUser) {
            finalStaffId = directStaffUser.id;
          }
        }
      }

      // 3. Compute Item Subtotals & Taxes
      let subtotal = 0;
      let totalTax = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found for ID: ${item.productId}`);
        }

        // Check available stock (from StoreInventory or Product fallback)
        const inv = await tx.storeInventory.findFirst({
          where: { storeId, productId: item.productId },
        });

        const availableQty = inv ? inv.quantity : (product.quantity ?? 9999);
        if (availableQty < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${availableQty}, Requested: ${item.quantity}`);
        }

        const unitPrice = item.price !== undefined ? parseFloat(item.price) : product.basePrice;
        const lineSubtotal = unitPrice * item.quantity;

        // Batch FIFO Stock Deduction & Tax Lock
        let batchTaxRate = item.taxRate !== undefined ? parseFloat(item.taxRate) : 0;
        let selectedBatchNumber = null;

        const activeBatches = await tx.storeBatch.findMany({
          where: { storeId, productId: item.productId, currentQuantity: { gt: 0 }, isActive: true },
          orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
        });

        let remainingToDeduct = item.quantity;
        for (const batch of activeBatches) {
          if (remainingToDeduct <= 0) break;
          const deductFromThisBatch = Math.min(batch.currentQuantity, remainingToDeduct);

          await tx.storeBatch.update({
            where: { id: batch.id },
            data: { currentQuantity: { decrement: deductFromThisBatch } },
          });

          if (!selectedBatchNumber) {
            selectedBatchNumber = batch.batchNumber;
            batchTaxRate = batch.taxRate || batchTaxRate;
          }
          remainingToDeduct -= deductFromThisBatch;
        }

        const lineTax = (lineSubtotal * batchTaxRate) / 100;
        subtotal += lineSubtotal;
        totalTax += lineTax;

        processedItems.push({
          productId: product.id,
          variantId: item.variantId || null,
          name: product.name || "POS Product",
          qty: item.quantity,
          unit: product.unit || "pcs",
          priceAtOrder: unitPrice,
          taxRate: batchTaxRate,
          taxAmount: lineTax,
          taxSplit: item.taxSplit || null,
        });

        // Deduct Inventory Stock
        const deltaQty = Math.round(-item.quantity);
        if (inv) {
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: item.quantity } },
          });

          await tx.stockLog.create({
            data: {
              inventoryId: inv.id,
              delta: deltaQty,
              reason: "POS Counter Sale",
              staffId: finalStaffId,
            },
          });
        } else {
          const newInv = await tx.storeInventory.create({
            data: {
              storeId,
              productId: product.id,
              quantity: Math.max(0, (product.quantity || 0) - item.quantity),
            },
          });

          await tx.stockLog.create({
            data: {
              inventoryId: newInv.id,
              delta: deltaQty,
              reason: "POS Counter Sale",
              staffId: finalStaffId,
            },
          });
        }

        // Increment Product Sales Count
        await tx.product.update({
          where: { id: product.id },
          data: { salesCount: { increment: item.quantity } },
        });
      }

      const discountAmount = parseFloat(discount) || 0;
      const totalAmount = Math.max(0, subtotal + totalTax - discountAmount);

      // Generate Order Number
      const orderCount = await tx.order.count({ where: { storeId } });
      const orderNumber = `POS-${Date.now().toString().slice(-6)}-${orderCount + 1}`;

      // 4. Create POS Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId,
          customerId: finalCustomerId,
          staffId: finalStaffId,
          type: "POS",
          status: "COMPLETED",
          subtotal,
          taxAmount: totalTax,
          discount: discountAmount,
          totalAmount,
          notes: notes || null,
          items: {
            create: processedItems,
          },
        },
      });

      // 4. Create Payment Record
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod || "CASH",
          status: "SUCCESS",
          amount: totalAmount,
        },
      });

      // 5. Generate Invoice Bill Record
      const billNumber = `INV-${Date.now().toString().slice(-6)}`;
      await tx.bill.create({
        data: {
          billNumber,
          orderId: order.id,
          storeId,
          type: "RECEIPT",
        },
      });

      // 6. Handle Khata / Credit Ledger if paymentMethod === "CREDIT"
      if (paymentMethod === "CREDIT" && targetStoreCustomer) {
        await tx.storeCustomer.update({
          where: { id: targetStoreCustomer.id },
          data: {
            khataBalance: { increment: totalAmount },
          },
        });
      }

      // 7. Update Customer Total Orders / Lifetime Spend if store customer exists
      if (targetStoreCustomer) {
        await tx.storeCustomer.update({
          where: { id: targetStoreCustomer.id },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: totalAmount },
          },
        });
      }

      if (finalCustomerId) {
        await tx.user.update({
          where: { id: finalCustomerId },
          data: {
            loyaltyPoints: { increment: Math.floor(totalAmount / 100) * 10 },
          },
        }).catch(() => {});
      }

      // 8. Return created order with full relationships
      return await tx.order.findUnique({
        where: { id: order.id },
        include: orderInclude,
      });
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
    if (storeId) {
      const storeCustomers = await prisma.storeCustomer.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });

      if (storeCustomers && storeCustomers.length > 0) {
        return storeCustomers.map((c) => ({
          id: c.id,
          name: c.name || "Customer",
          email: c.email || "",
          phone: c.phone || "",
          loyaltyPoints: c.loyaltyPoints || 0,
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0,
          khataBalance: c.khataBalance || 0,
          notes: c.notes || "",
          createdAt: c.createdAt,
          orders: [],
        }));
      }
    }

    // Fallback: If no store-specific customer records, fetch system users
    let customers = [];
    if (storeId) {
      customers = await prisma.user.findMany({
        where: {
          OR: [
            { orders: { some: { storeId } } },
            { storeId: storeId }
          ]
        },
        include: {
          orders: {
            where: { storeId },
            select: { id: true, totalAmount: true, createdAt: true, status: true, orderNumber: true, type: true },
            orderBy: { createdAt: "desc" }
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!customers || customers.length === 0) {
      customers = await prisma.user.findMany({
        where: {},
        include: {
          orders: {
            select: { id: true, totalAmount: true, createdAt: true, status: true, orderNumber: true, type: true },
            orderBy: { createdAt: "desc" },
            take: 10
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    return customers.map((c) => {
      const validOrders = c.orders ? c.orders.filter((o) => o.status !== "CANCELLED") : [];
      const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      return {
        id: c.id,
        name: c.name || "Customer",
        email: c.email || "",
        phone: c.phone || "",
        loyaltyPoints: c.loyaltyPoints || 0,
        totalOrders: validOrders.length,
        totalSpent,
        khataBalance: c.khataBalance || 0,
        createdAt: c.createdAt,
        orders: c.orders || [],
      };
    });
  }

  async createCustomer(storeId, data) {
    return prisma.storeCustomer.create({
      data: {
        storeId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        notes: data.notes || null,
        khataBalance: data.khataBalance || 0,
        loyaltyPoints: data.loyaltyPoints || 0,
      },
    });
  }

  async updateCustomer(storeId, customerId, data) {
    const existing = await prisma.storeCustomer.findFirst({
      where: { id: customerId, storeId },
    });

    if (existing) {
      return prisma.storeCustomer.update({
        where: { id: customerId },
        data,
      });
    }

    return prisma.user.update({
      where: { id: customerId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.khataBalance !== undefined && { khataBalance: data.khataBalance }),
      },
    });
  }

  async deleteCustomer(storeId, customerId) {
    const existing = await prisma.storeCustomer.findFirst({
      where: { id: customerId, storeId },
    });

    if (existing) {
      return prisma.storeCustomer.delete({
        where: { id: customerId },
      });
    }

    return prisma.user.delete({
      where: { id: customerId },
    }).catch(() => null);
  }

  // ── Staff ──
  async staff(storeId) {
    let storeStaffList = [];
    if (storeId) {
      storeStaffList = await prisma.storeStaff.findMany({
        where: { storeId },
        include: {
          user: true,
          shifts: { orderBy: { clockIn: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback: If no staff found for specific storeId, fetch all staff in system
    if (!storeStaffList || storeStaffList.length === 0) {
      storeStaffList = await prisma.storeStaff.findMany({
        include: {
          user: true,
          shifts: { orderBy: { clockIn: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    return storeStaffList.map((member) => {
      const totalOrders = (member.shifts || []).reduce((acc, s) => acc + (s.ordersCount || 0), 0);
      const totalRevenue = (member.shifts || []).reduce((acc, s) => acc + (s.revenue || 0), 0);
      const totalShifts = (member.shifts || []).length;

      return {
        id: member.id,
        name: member.name || member.user?.name || "Staff Member",
        email: member.email || member.user?.email || "",
        phone: member.phone || member.user?.phone || "",
        role: member.role || "CASHIER",
        shift: member.shift || "Morning",
        status: member.isActive ? "active" : "inactive",
        isActive: member.isActive !== false,
        pin: member.pin || member.user?.pin || "1234",
        createdAt: member.createdAt,
        joinedAt: member.joinedAt || member.createdAt,
        shifts: member.shifts || [],
        performance: {
          ordersProcessed: totalOrders,
          totalRevenue,
          totalShifts,
        },
      };
    });
  }

  async createStaff(storeId, userData) {
    let targetStoreId = storeId;
    if (!targetStoreId) {
      const firstStore = await this.getFirstStore();
      targetStoreId = firstStore?.id;
    }

    let userId = null;
    if (userData.phone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: userData.phone },
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const roleToSave = normalizeStaffRole(userData.role);

    return await prisma.storeStaff.create({
      data: {
        storeId: targetStoreId,
        userId,
        name: userData.name,
        email: userData.email || null,
        phone: userData.phone,
        role: roleToSave,
        shift: userData.shift || "Morning",
        isActive: true,
      },
    });
  }

  async updateStaff(storeId, staffId, userData) {
    const updateData = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.shift !== undefined) updateData.shift = userData.shift;
    if (userData.role) updateData.role = normalizeStaffRole(userData.role);
    if (userData.isActive !== undefined) {
      updateData.isActive = userData.isActive;
    } else if (userData.status !== undefined) {
      updateData.isActive = userData.status === "active";
    }

    return await prisma.storeStaff.update({
      where: { id: staffId },
      data: updateData,
    });
  }

  async deleteStaff(storeId, staffId) {
    return await prisma.storeStaff.delete({
      where: { id: staffId },
    });
  }

  async toggleStaffClock(storeId, staffId) {
    const latestShift = await prisma.shift.findFirst({
      where: { staffId },
      orderBy: { clockIn: "desc" },
    });

    if (latestShift && !latestShift.clockOut) {
      return await prisma.shift.update({
        where: { id: latestShift.id },
        data: { clockOut: new Date() },
      });
    } else {
      return await prisma.shift.create({
        data: {
          staffId,
          clockIn: new Date(),
        },
      });
    }
  }

  async updateStaffShift(storeId, staffId, shiftName) {
    return await prisma.storeStaff.update({
      where: { id: staffId },
      data: { shift: shiftName },
    });
  }

  // ── Analytics ──
  async analytics(storeId) {
    const [paymentMethods, topProducts, hourly, slowProducts] = await Promise.all([
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
        include: { inventory: true, category: true },
      }),
      prisma.order.findMany({
        where: { storeId },
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

export const storePanelRepository = new StorePanelRepository();
