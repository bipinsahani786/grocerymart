import { prisma } from "../../../config/prisma.js";

const orderInclude = {
  store: { select: { id: true, name: true, address: true, phone: true, gstin: true } },
  items: { include: { product: true, variant: true } },
  payment: true,
  bill: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
  staff: { select: { id: true, name: true, email: true, phone: true } },
};

export class OrdersRepository {
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
      // 1. Resolve Customer (User only)
      let finalCustomerId = null;
      let targetPhone = customerPhone?.trim() || null;
      let targetName = customerName?.trim() || "POS Customer";
      let userObj = null;

      if (customerId) {
        userObj = await tx.user.findUnique({ where: { id: customerId } }).catch(() => null);
        if (userObj) {
          finalCustomerId = userObj.id;
          targetPhone = userObj.phone || targetPhone;
          targetName = userObj.name || targetName;
        }
      }

      if (!finalCustomerId && targetPhone) {
        userObj = await tx.user.findUnique({ where: { phone: targetPhone } });
        if (!userObj) {
          userObj = await tx.user.create({
            data: {
              phone: targetPhone,
              name: targetName,
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
        finalCustomerId = userObj.id;
      }

      // 2. Resolve Staff / Cashier (StoreStaff -> User mapping)
      let finalStaffId = staffUserId || null;
      const targetStaffId = staffId || staffUserId;

      if (targetStaffId) {
        const storeStaffObj = await tx.storeStaff.findFirst({
          where: { id: targetStaffId },
        });
        if (storeStaffObj && storeStaffObj.userId) {
          finalStaffId = storeStaffObj.userId;
        } else {
          const directUser = await tx.user.findUnique({ where: { id: targetStaffId } }).catch(() => null);
          if (directUser) {
            finalStaffId = directUser.id;
          }
        }
      }

      // 3. Calculate Totals and Validate Inventory Stock levels
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, storeId },
          include: { inventory: true },
        });

        if (!product) {
          throw new Error(`Product not found in store catalog: ${item.productId}`);
        }

        const price = item.price !== undefined ? parseFloat(item.price) : product.basePrice;
        const qty = parseFloat(item.quantity);
        const itemTotal = price * qty;
        subtotal += itemTotal;

        // Deduct inventory stock levels
        const inv = product.inventory[0];
        if (inv) {
          if (inv.quantity < qty) {
            throw new Error(`Insufficient stock for product ${product.name}. Requested: ${qty}, Available: ${inv.quantity}`);
          }
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: qty } },
          });
        }

        orderItemsData.push({
          productId: product.id,
          name: product.name,
          qty,
          unit: product.unit,
          priceAtOrder: price,
          taxRate: item.taxRate !== undefined ? parseFloat(item.taxRate) : 0,
        });
      }

      const totalAmount = Math.max(0, subtotal - parseFloat(discount));

      // 4. Create Order Record
      const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          type: "POS",
          status: "COMPLETED",
          storeId,
          customerId: finalCustomerId,
          staffId: finalStaffId,
          subtotal,
          discount: parseFloat(discount),
          totalAmount,
          notes,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: "SUCCESS",
              amount: totalAmount,
            },
          },
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
      if (paymentMethod === "CREDIT" && finalCustomerId) {
        await tx.user.update({
          where: { id: finalCustomerId },
          data: {
            khataBalance: { increment: totalAmount },
          },
        });
      }

      // 7. Update Customer Total Orders / Lifetime Spend and Loyalty Points
      if (finalCustomerId) {
        await tx.user.update({
          where: { id: finalCustomerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: totalAmount },
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
