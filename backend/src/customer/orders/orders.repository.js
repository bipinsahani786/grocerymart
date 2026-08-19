import { prisma } from "../../../config/prisma.js";

export class CustomerOrdersRepository {
  /**
   * Find a user by ID or Phone or Email
   */
  async findUser(identifier) {
    if (!identifier) return null;
    const cleanPhone = String(identifier).replace(/^\+91/, "").replace(/\s+/g, "").trim();
    return await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { phone: identifier },
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { email: identifier },
        ],
      },
    });
  }

  /**
   * Find a store by ID or fallback to first active store
   */
  async findStore(storeId) {
    if (storeId) {
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (store) return store;
    }
    return await prisma.store.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Resolve or create an Address record for delivery
   */
  async resolveAddress(userId, addressText, addressId) {
    if (addressId) {
      const existing = await prisma.address.findUnique({ where: { id: addressId } });
      if (existing) return existing.id;
    }

    if (userId && addressText) {
      const existing = await prisma.address.findFirst({
        where: {
          userId,
          street: { contains: addressText.slice(0, 20), mode: "insensitive" },
        },
      });
      if (existing) return existing.id;

      const created = await prisma.address.create({
        data: {
          userId,
          street: addressText,
          city: "Local",
          state: "State",
          zipCode: addressText.match(/\b\d{6}\b/)?.[0] || "000000",
        },
      });
      return created.id;
    }

    return null;
  }

  /**
   * Generate sequential human-readable Order Number
   */
  generateOrderNumber(type = "DELIVERY") {
    const prefix = type === "CLICK_COLLECT" ? "CNC" : "DEL";
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Create an Order with all items, payment, and status history in a transaction
   */
  async createOrder(orderData) {
    const {
      customerId,
      storeId,
      addressId,
      type,
      subtotal,
      discount,
      discountReason,
      taxAmount,
      deliveryFee,
      totalAmount,
      customerNote,
      items,
      paymentMethod,
      paymentStatus,
    } = orderData;

    const orderNumber = this.generateOrderNumber(type);

    return await prisma.$transaction(async (tx) => {
      // 1. Create Main Order Record
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          type: type === "pickup" || type === "CLICK_COLLECT" ? "CLICK_COLLECT" : "DELIVERY",
          status: "PLACED",
          customerId: customerId || null,
          storeId,
          addressId: addressId || null,
          subtotal: parseFloat(subtotal) || 0,
          discount: parseFloat(discount) || 0,
          discountReason: discountReason || null,
          taxAmount: parseFloat(taxAmount) || 0,
          deliveryFee: parseFloat(deliveryFee) || 0,
          totalAmount: parseFloat(totalAmount) || 0,
          customerNote: customerNote || null,
          items: {
            create: (items || []).map((item) => ({
              name: item.name || "Product",
              qty: parseFloat(item.quantity || item.qty) || 1,
              unit: item.weight || item.unit || "pcs",
              priceAtOrder: parseFloat(item.price || item.priceAtOrder) || 0,
              taxAmount: 0,
              itemDiscount: 0,
              productId: item.productId || (item.id && item.id.length > 20 ? item.id : null),
            })),
          },
          payment: {
            create: {
              method:
                paymentMethod === "upi"
                  ? "UPI"
                  : paymentMethod === "card"
                  ? "CARD"
                  : paymentMethod === "wallet"
                  ? "ONLINE"
                  : "COD",
              status: paymentStatus || (paymentMethod === "cod" ? "PENDING" : "SUCCESS"),
              amount: parseFloat(totalAmount) || 0,
            },
          },
          statusHistory: {
            create: {
              status: "PLACED",
              note: "Order placed via Customer Mobile App",
            },
          },
        },
        include: {
          items: true,
          payment: true,
          store: {
            select: { id: true, name: true, address: true, phone: true },
          },
          address: true,
        },
      });

      // 2. Update Customer lifetime statistics in User table
      if (customerId) {
        await tx.user.update({
          where: { id: customerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: parseFloat(totalAmount) || 0 },
          },
        }).catch((err) => console.warn("Failed to update user order stats:", err));
      }

      return createdOrder;
    });
  }

  /**
   * Fetch customer order history with flexible matching
   */
  async getCustomerOrders(customerId, userPhone = null) {
    const orConditions = [];

    if (customerId) {
      orConditions.push({ customerId });
      orConditions.push({ customer: { id: customerId } });
    }

    if (userPhone) {
      const cleanPhone = String(userPhone).replace(/^\+91/, "").replace(/\s+/g, "").trim();
      orConditions.push({ customer: { phone: userPhone } });
      if (cleanPhone) {
        orConditions.push({ customer: { phone: cleanPhone } });
        orConditions.push({ customer: { phone: `+91${cleanPhone}` } });
        orConditions.push({ customer: { phone: { contains: cleanPhone } } });
      }
    }

    // If no specific user filters provided, return all recently placed orders
    const where = orConditions.length > 0 ? { OR: orConditions } : {};

    return await prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        store: {
          select: { id: true, name: true, address: true, phone: true },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch a single order by ID
   */
  async getOrderById(orderId) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        store: {
          select: { id: true, name: true, address: true, phone: true },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }
}

export const customerOrdersRepository = new CustomerOrdersRepository();
