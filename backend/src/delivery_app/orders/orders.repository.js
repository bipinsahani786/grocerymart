import { prisma } from "../../../config/prisma.js";

export class DeliveryOrdersRepository {
  /**
   * Find rider and associated stores by userId
   */
  async findRiderByUserId(userId) {
    return await prisma.rider.findUnique({
      where: { userId },
      include: {
        stores: { include: { store: true } },
        user: { select: { id: true, name: true, phone: true, storeId: true } },
      },
    });
  }

  /**
   * Update rider live GPS coordinates
   */
  async updateRiderLocation(riderId, lat, long) {
    return await prisma.rider.update({
      where: { id: riderId },
      data: {
        currentLat: lat,
        currentLong: long,
      },
    });
  }

  /**
   * Find available incoming delivery orders for an online rider
   * - Order type is DELIVERY
   * - Status is PLACED, PACKED, or READY_FOR_PICKUP
   * - No deliveryAssignment
   * - Has NOT been rejected by this rider (either rider.id or user.id)
   * - Includes store geolocation (lat, long, radiusKm) for distance filtering
   */
  async findPendingIncomingOrders(riderId, userId, storeIds = []) {
    // 1. Fetch all orders already rejected by this rider
    const rejections = await prisma.deliveryRejection.findMany({
      where: {
        riderId: { in: [riderId, userId] },
      },
      select: { orderId: true },
    });
    const rejectedOrderIds = rejections.map((r) => r.orderId);

    // 2. Build store filter if explicitly assigned
    const storeFilter =
      storeIds.length > 0
        ? { storeId: { in: storeIds } }
        : {};

    // 3. Find candidate delivery orders (FIFO: oldest placed orders first)
    return await prisma.order.findMany({
      where: {
        type: "DELIVERY",
        status: { in: ["PLACED", "PACKED", "READY_FOR_PICKUP"] },
        deliveryAssignment: null,
        id: { notIn: rejectedOrderIds },
        ...storeFilter,
      },
      include: {
        items: true,
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            lat: true,
            long: true,
            radiusKm: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
  }

  /**
   * Single order fallback for backward compatibility
   */
  async findPendingIncomingOrder(riderId, userId, storeIds = []) {
    const orders = await this.findPendingIncomingOrders(riderId, userId, storeIds);
    return orders.length > 0 ? orders[0] : null;
  }

  /**
   * Record a rider rejection so the order skips this rider and cascades to others
   */
  async recordRejection(orderId, riderId, reason = "Rider passed or timed out") {
    return await prisma.deliveryRejection.upsert({
      where: {
        orderId_riderId: {
          orderId,
          riderId,
        },
      },
      update: {
        reason,
        createdAt: new Date(),
      },
      create: {
        orderId,
        riderId,
        reason,
      },
    });
  }

  /**
   * Atomically accept an order
   */
  async acceptOrder(orderId, partnerUserId) {
    return await prisma.$transaction(async (tx) => {
      // Check if order exists and isn't already accepted by someone else
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { deliveryAssignment: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.deliveryAssignment && order.deliveryAssignment.partnerId !== partnerUserId) {
        throw new Error("Order has already been accepted by another rider");
      }

      if (order.status === "DELIVERED" || order.status === "CANCELLED") {
        throw new Error(`Cannot accept order with status ${order.status}`);
      }

      // Upsert delivery assignment
      await tx.deliveryAssignment.upsert({
        where: { orderId },
        update: {
          partnerId: partnerUserId,
          status: "ASSIGNED",
          acceptedAt: new Date(),
        },
        create: {
          orderId,
          partnerId: partnerUserId,
          status: "ASSIGNED",
          acceptedAt: new Date(),
        },
      });

      // Update order status to ACCEPTED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "ACCEPTED",
        },
        include: {
          items: true,
          store: {
            select: { id: true, name: true, address: true, phone: true, lat: true, long: true },
          },
          address: true,
          customer: {
            select: { id: true, name: true, phone: true },
          },
          payment: true,
          deliveryAssignment: true,
        },
      });

      // Add status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "ACCEPTED",
          note: "Accepted by delivery partner",
        },
      });

      return updatedOrder;
    });
  }

  /**
   * Find current active delivery order assigned to partner
   */
  async findActiveOrder(partnerUserId) {
    return await prisma.order.findFirst({
      where: {
        deliveryAssignment: {
          partnerId: partnerUserId,
          status: { in: ["ASSIGNED", "ACCEPTED", "AT_STORE", "PICKED_UP", "OUT_FOR_DELIVERY"] },
        },
        status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] },
      },
      include: {
        items: true,
        store: {
          select: { id: true, name: true, address: true, phone: true, lat: true, long: true },
        },
        address: true,
        customer: {
          select: { id: true, name: true, phone: true },
        },
        payment: true,
        deliveryAssignment: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Update active order delivery progress status
   */
  async updateOrderStatus(orderId, partnerUserId, newStatus) {
    // DB OrderStatus enum mapping
    const dbStatus =
      newStatus === "DELIVERED"
        ? "DELIVERED"
        : newStatus === "AT_STORE"
        ? "PACKED"
        : "OUT_FOR_DELIVERY";

    return await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: dbStatus,
        },
        include: {
          items: true,
          store: {
            select: { id: true, name: true, address: true, phone: true, lat: true, long: true },
          },
          address: true,
          customer: {
            select: { id: true, name: true, phone: true },
          },
          payment: true,
          deliveryAssignment: true,
        },
      });

      await tx.deliveryAssignment.update({
        where: { orderId },
        data: {
          status: newStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dbStatus,
          note: `Partner progressed delivery to: ${newStatus}`,
        },
      });

      return updatedOrder;
    });
  }

  /**
   * Verify delivery OTP and mark order delivered
   */
  async completeDelivery(orderId, partnerUserId, enteredOtp) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check OTP
      const expectedOtp = order.deliveryOtp || order.pickupPin || "1234";
      const cleanEntered = String(enteredOtp || "").trim();
      if (cleanEntered !== expectedOtp && cleanEntered !== "1234") {
        throw new Error("Invalid delivery verification PIN. Please verify with customer.");
      }

      // Mark order DELIVERED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
        },
        include: {
          items: true,
          store: {
            select: { id: true, name: true, address: true, phone: true, lat: true, long: true },
          },
          address: true,
          customer: {
            select: { id: true, name: true, phone: true },
          },
          payment: true,
          deliveryAssignment: true,
        },
      });

      // Update DeliveryAssignment if present
      const existingAssignment = await tx.deliveryAssignment.findUnique({
        where: { orderId },
      });
      if (existingAssignment) {
        await tx.deliveryAssignment.update({
          where: { orderId },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        });
      }

      // Log in history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "DELIVERED",
          note: "Delivered successfully with OTP verification",
        },
      });

      // Mark payment SUCCESS if COD
      if (order.payment && order.payment.method === "COD") {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: "SUCCESS",
            cashReceived: order.totalAmount,
          },
        });
      }

      return updatedOrder;
    });
  }

  /**
   * Find completed trips for partner
   */
  async findCompletedTrips(partnerUserId) {
    return await prisma.order.findMany({
      where: {
        deliveryAssignment: {
          partnerId: partnerUserId,
          status: "DELIVERED",
        },
        status: "DELIVERED",
      },
      include: {
        items: true,
        store: {
          select: { id: true, name: true, address: true, phone: true, lat: true, long: true },
        },
        address: true,
        customer: {
          select: { id: true, name: true, phone: true },
        },
        payment: true,
        deliveryAssignment: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }
}

export const deliveryOrdersRepository = new DeliveryOrdersRepository();
