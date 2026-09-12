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
  formatDeliveryOrder(order, rider = null, calculatedDistanceKm = null) {
    if (!order) return null;

    const riderLat = rider?.currentLat;
    const riderLng = rider?.currentLong;
    const storeLat = order.store?.lat;
    const storeLng = order.store?.long;

    let storeDistanceKm = 1.2;
    if (calculatedDistanceKm !== null && calculatedDistanceKm !== undefined) {
      storeDistanceKm = calculatedDistanceKm;
    } else if (
      riderLat !== undefined &&
      riderLat !== null &&
      riderLng !== undefined &&
      riderLng !== null &&
      storeLat !== undefined &&
      storeLat !== null &&
      storeLng !== undefined &&
      storeLng !== null &&
      !(storeLat === 0 && storeLng === 0)
    ) {
      storeDistanceKm = this.calculateDistanceKm(riderLat, riderLng, storeLat, storeLng);
    }

    const customerDistanceKm = 2.1;
    const storeEstimatedMins = Math.max(3, Math.round(storeDistanceKm * 3.5));
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
   * Get incoming order dispatched to this online rider with strict geographical matching
   */
  async getIncomingOrder(userId, coords = null) {
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

    // Resolve rider's effective coordinates
    let riderLat =
      coords?.lat !== undefined && !isNaN(coords.lat) ? coords.lat : rider.currentLat;
    let riderLng =
      coords?.lng !== undefined && !isNaN(coords.lng) ? coords.lng : rider.currentLong;

    // Asynchronously update rider live location in database if new coords are provided
    if (
      coords?.lat !== undefined &&
      coords?.lng !== undefined &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
    ) {
      deliveryOrdersRepository
        .updateRiderLocation(rider.id, coords.lat, coords.lng)
        .catch(() => {});
    }

    // Resolve store IDs associated with this rider
    const storeIds = (rider.stores || []).map((s) => s.storeId);
    if (rider.user?.storeId && !storeIds.includes(rider.user.storeId)) {
      storeIds.push(rider.user.storeId);
    }

    // If rider has no known coordinates and no specific store assigned, DO NOT dispatch blind nationwide orders
    if (
      (riderLat === null || riderLat === undefined || riderLng === null || riderLng === undefined) &&
      storeIds.length === 0
    ) {
      return null;
    }

    const candidateOrders = await deliveryOrdersRepository.findPendingIncomingOrders(
      rider.id,
      userId,
      storeIds
    );

    if (!candidateOrders || candidateOrders.length === 0) {
      return null;
    }

    // Strict geographical distance limit: max 15 km (or store's delivery radius)
    const MAX_DISPATCH_RADIUS_KM = 15;
    let bestMatchedOrder = null;
    let shortestDistanceKm = Infinity;

    for (const order of candidateOrders) {
      const store = order.store;
      const storeLat = store?.lat;
      const storeLng = store?.long;
      const isAssignedToStore = storeIds.includes(order.storeId);

      // Check distance between rider and store
      if (
        storeLat !== undefined &&
        storeLat !== null &&
        storeLng !== undefined &&
        storeLng !== null &&
        !(storeLat === 0 && storeLng === 0) &&
        riderLat !== undefined &&
        riderLat !== null &&
        riderLng !== undefined &&
        riderLng !== null
      ) {
        const distanceKm = this.calculateDistanceKm(riderLat, riderLng, storeLat, storeLng);
        const maxAllowedRadius = Math.max(store.radiusKm || 5, MAX_DISPATCH_RADIUS_KM);

        // Strict rejection if rider is outside the dispatch zone (e.g. Noida vs Bihar ~850km)
        if (distanceKm <= maxAllowedRadius) {
          if (distanceKm < shortestDistanceKm) {
            shortestDistanceKm = distanceKm;
            bestMatchedOrder = order;
          }
        }
      } else if (isAssignedToStore) {
        // Rider explicitly assigned to this store through store staff/partnership
        bestMatchedOrder = order;
        shortestDistanceKm = 1.5;
        break;
      }
    }

    if (!bestMatchedOrder) {
      return null;
    }

    const updatedRider = { ...rider, currentLat: riderLat, currentLong: riderLng };
    return this.formatDeliveryOrder(
      bestMatchedOrder,
      updatedRider,
      shortestDistanceKm !== Infinity ? shortestDistanceKm : null
    );
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
