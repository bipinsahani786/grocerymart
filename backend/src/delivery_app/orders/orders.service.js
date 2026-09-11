import { deliveryOrdersRepository } from "./orders.repository.js";
import { earningsRepository } from "../earnings/earnings.repository.js";
import { AppError } from "../../utils/AppError.js";

export class DeliveryOrdersService {
  /**
   * Distance calculator (Haversine Formula) in km
   */
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.max(0.4, parseFloat(d.toFixed(1)));
  }

  /**
   * Format DB Order object into exact DeliveryOrder interface expected by partner mobile app
   */
  formatDeliveryOrder(order, rider = null) {
    if (!order) return null;

    const riderLat = rider?.currentLat || 25.6003;
    const riderLng = rider?.currentLong || 85.1872;
    const storeLat = order.store?.lat;
    const storeLng = order.store?.long;

    const storeDistanceKm =
      storeLat && storeLng
        ? this.calculateDistanceKm(riderLat, riderLng, storeLat, storeLng)
        : 0.8;

    const customerDistanceKm = 2.1;
    const storeEstimatedMins = Math.max(3, Math.round(storeDistanceKm * 4));
    const customerEstimatedMins = Math.max(6, Math.round(customerDistanceKm * 4));

    const isCod = order.payment?.method === "COD";
    const paymentMode = isCod ? "CASH_ON_DELIVERY" : "PREPAID";

    // Payout breakdown
    const basePayout = 50;
    const surgeBonus = 25;
    const tipAmount = 15;
    const totalPayout = basePayout + surgeBonus + tipAmount;

    // Status mapping for partner app
    let uiStatus = "PENDING";
    if (order.status === "DELIVERED") {
      uiStatus = "DELIVERED";
    } else if (order.deliveryAssignment) {
      const assignStatus = order.deliveryAssignment.status;
      if (assignStatus === "OUT_FOR_DELIVERY" || order.status === "OUT_FOR_DELIVERY") {
        uiStatus = "OUT_FOR_DELIVERY";
      } else if (assignStatus === "PICKED_UP") {
        uiStatus = "PICKED_UP";
      } else if (assignStatus === "AT_STORE") {
        uiStatus = "AT_STORE";
      } else {
        uiStatus = "ACCEPTED";
      }
    } else if (order.status === "ACCEPTED") {
      uiStatus = "ACCEPTED";
    }

    const customerAddressStr = order.address
      ? [order.address.street, order.address.city, order.address.zipCode]
          .filter(Boolean)
          .join(", ")
      : "Customer Delivery Address";

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      storeName: order.store?.name || "GroceryMart Hub",
      storeAddress: order.store?.address || "Store Hub Location",
      storeDistanceKm,
      storeEstimatedMins,
      storePhone: order.store?.phone || "+91 98765 43210",
      customerName: order.customer?.name || "Customer",
      customerAddress: customerAddressStr,
      customerDistanceKm,
      customerEstimatedMins,
      customerPhone: order.customer?.phone || "+91 98000 00000",
      deliveryNotes: order.customerNote || undefined,
      itemsCount: order.items?.length || 0,
      items: (order.items || []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.qty || 1,
        unit: item.unit || "pcs",
        category: "Grocery",
        scanned: Boolean(item.isPacked),
        price: item.priceAtOrder || 0,
      })),
      totalAmount: order.totalAmount || 0,
      paymentMode,
      payoutEarnings: basePayout,
      surgeBonus,
      tipAmount,
      totalPayout,
      status: uiStatus,
      otp: order.deliveryOtp || order.pickupPin || "1234",
      createdAt: order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Just now",
      deliveredAt: order.deliveryAssignment?.deliveredAt
        ? new Date(order.deliveryAssignment.deliveredAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : undefined,
    };
  }

  /**
   * Get incoming order dispatched to this online rider
   */
  async getIncomingOrder(userId) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    if (!rider) {
      throw new AppError("Delivery partner profile not found", 404);
    }

    // Must be online to receive orders
    if (!rider.isOnline) {
      return null;
    }

    // If rider already has an active ongoing delivery, don't dispatch another
    const existingActive = await deliveryOrdersRepository.findActiveOrder(userId);
    if (existingActive) {
      return null;
    }

    // Resolve store IDs associated with this rider
    const storeIds = (rider.stores || []).map((s) => s.storeId);
    if (rider.user?.storeId && !storeIds.includes(rider.user.storeId)) {
      storeIds.push(rider.user.storeId);
    }

    const pendingOrder = await deliveryOrdersRepository.findPendingIncomingOrder(
      rider.id,
      userId,
      storeIds
    );

    if (!pendingOrder) {
      return null;
    }

    return this.formatDeliveryOrder(pendingOrder, rider);
  }

  /**
   * Accept an incoming order
   */
  async acceptOrder(orderId, userId) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    if (!rider) {
      throw new AppError("Delivery partner profile not found", 404);
    }

    try {
      const acceptedOrder = await deliveryOrdersRepository.acceptOrder(orderId, userId);
      return this.formatDeliveryOrder(acceptedOrder, rider);
    } catch (err) {
      throw new AppError(err.message || "Failed to accept order", 400);
    }
  }

  /**
   * Reject an incoming order (cascades to other online riders)
   */
  async rejectOrder(orderId, userId, reason = "Rider passed") {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    if (!rider) {
      throw new AppError("Delivery partner profile not found", 404);
    }

    await deliveryOrdersRepository.recordRejection(orderId, rider.id, reason);
    await deliveryOrdersRepository.recordRejection(orderId, userId, reason);

    return { success: true, message: "Order passed to next available rider" };
  }

  /**
   * Get current active delivery order
   */
  async getActiveOrder(userId) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    const activeOrder = await deliveryOrdersRepository.findActiveOrder(userId);
    if (!activeOrder) {
      return null;
    }
    return this.formatDeliveryOrder(activeOrder, rider);
  }

  /**
   * Update delivery progress status
   */
  async updateOrderStatus(orderId, userId, status) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    const updated = await deliveryOrdersRepository.updateOrderStatus(orderId, userId, status);
    return this.formatDeliveryOrder(updated, rider);
  }

  /**
   * Complete delivery with customer verification OTP
   */
  async completeDelivery(orderId, userId, enteredOtp) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    if (!rider) {
      throw new AppError("Delivery partner not found", 404);
    }

    try {
      const completedOrder = await deliveryOrdersRepository.completeDelivery(
        orderId,
        userId,
        enteredOtp
      );

      // Record earnings into wallet and ledger
      const isCod = completedOrder.payment?.method === "COD";
      const basePayout = 50;
      const surgeBonus = 25;
      const tipAmount = 15;

      await earningsRepository.executeDeliveryEarnings(userId, {
        payout: basePayout,
        tip: tipAmount,
        surge: surgeBonus,
        isCod,
        codAmount: isCod ? completedOrder.totalAmount : 0,
        orderTag: completedOrder.orderNumber,
      });

      return this.formatDeliveryOrder(completedOrder, rider);
    } catch (err) {
      throw new AppError(err.message || "Failed to complete delivery", 400);
    }
  }

  /**
   * Get all completed trips for this partner
   */
  async getCompletedTrips(userId) {
    const rider = await deliveryOrdersRepository.findRiderByUserId(userId);
    const trips = await deliveryOrdersRepository.findCompletedTrips(userId);
    return trips.map((t) => this.formatDeliveryOrder(t, rider));
  }
}

export const deliveryOrdersService = new DeliveryOrdersService();
