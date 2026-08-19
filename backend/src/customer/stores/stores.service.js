import { customerStoresRepository } from "./stores.repository.js";

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export class CustomerStoresService {
  async getLocationByPincode(pincode) {
    const store = await customerStoresRepository.findStoreByPincode(pincode);
    if (!store) {
      return null;
    }

    return {
      pincode: pincode || "",
      storeName: store.name,
      address: store.address,
    };
  }

  async getStores(pincode = "", userLat = null, userLng = null) {
    const stores = await customerStoresRepository.findAllActiveStores();
    const cleanPin = String(pincode || "").trim().toLowerCase();

    // Sort stores so that any store matching pincode/locality comes FIRST
    const sortedStores = [...stores].sort((a, b) => {
      const aAddr = (a.address || "").toLowerCase();
      const aName = (a.name || "").toLowerCase();
      const bAddr = (b.address || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();

      const aMatch = cleanPin && (aAddr.includes(cleanPin) || aName.includes(cleanPin)) ? 1 : 0;
      const bMatch = cleanPin && (bAddr.includes(cleanPin) || bName.includes(cleanPin)) ? 1 : 0;
      return bMatch - aMatch;
    });

    return sortedStores.map((s, index) => {
      const sAddr = (s.address || "").toLowerCase();
      const isDirectMatch = cleanPin && (sAddr.includes(cleanPin) || s.name.toLowerCase().includes(cleanPin));

      let calculatedKm = null;
      if (userLat && userLng && s.lat && s.long) {
        calculatedKm = calculateHaversineKm(s.lat, s.long, parseFloat(userLat), parseFloat(userLng));
      }
      const distNum = calculatedKm !== null ? calculatedKm : isDirectMatch ? 0.8 : parseFloat((1.2 + index * 1.5).toFixed(1));

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        lat: s.lat,
        long: s.long,
        distanceKm: distNum,
        distance: isDirectMatch ? `${distNum} km away (Nearest Hub)` : `${distNum} km away`,
        readyTime: isDirectMatch ? "Ready in 8-10 mins" : "Ready in 15-20 mins",
        openingTime: s.openingTime,
        closingTime: s.closingTime,
        deliveryChargePerKm: s.deliveryChargePerKm || 0,
        freeDeliveryKmRadius: s.freeDeliveryKmRadius || 0,
        minDeliveryCharge: s.minDeliveryCharge || 0,
        deliveryEnabled: s.deliveryEnabled !== false,
        clickCollectEnabled: s.clickCollectEnabled !== false,
      };
    });
  }

  async getDeliveryConfig({ storeId = "", pincode = "", distanceKm = null, subtotal = 0, userLat = null, userLng = null } = {}) {
    let store = null;
    const cleanStoreId = String(storeId || "").trim();
    const cleanPin = String(pincode || "").trim();

    if (cleanStoreId) {
      const all = await customerStoresRepository.findAllActiveStores();
      store = all.find((s) => s.id === cleanStoreId);
    }
    if (!store && cleanPin) {
      store = await customerStoresRepository.findStoreByPincode(cleanPin);
    }
    if (!store) {
      store = await customerStoresRepository.findStoreByPincode("");
    }

    const minCharge = store && typeof store.minDeliveryCharge === "number"
      ? store.minDeliveryCharge
      : store && store.minDeliveryCharge !== undefined && store.minDeliveryCharge !== null
      ? parseFloat(store.minDeliveryCharge) || 0
      : 30.0;

    const chargePerKm = store && typeof store.deliveryChargePerKm === "number"
      ? store.deliveryChargePerKm
      : store && store.deliveryChargePerKm !== undefined && store.deliveryChargePerKm !== null
      ? parseFloat(store.deliveryChargePerKm) || 0
      : 0;

    const freeKm = store && typeof store.freeDeliveryKmRadius === "number"
      ? store.freeDeliveryKmRadius
      : store && store.freeDeliveryKmRadius !== undefined && store.freeDeliveryKmRadius !== null
      ? parseFloat(store.freeDeliveryKmRadius) || 0
      : 0;

    // Calculate actual distance in KM
    let dist = parseFloat(distanceKm);
    if (isNaN(dist) || dist <= 0) {
      if (userLat && userLng && store && store.lat && store.long) {
        const computed = calculateHaversineKm(store.lat, store.long, parseFloat(userLat), parseFloat(userLng));
        dist = computed !== null ? computed : 1.2;
      } else {
        dist = 1.2; // default estimated hub distance
      }
    }

    const subtotalNum = parseFloat(subtotal) || 0;
    const freeDeliveryThreshold = 299.0;
    let isFreeDelivery = false;
    let deliveryFee = 0;
    let deliveryRuleReason = "";

    // ── Apply Store Panel Exact Calculation Rule ──
    if (subtotalNum >= freeDeliveryThreshold && subtotalNum > 0) {
      isFreeDelivery = true;
      deliveryFee = 0;
      deliveryRuleReason = `Free delivery on orders above ₹${freeDeliveryThreshold}`;
    } else if (freeKm > 0 && dist <= freeKm) {
      // FREE under free delivery KM radius!
      isFreeDelivery = true;
      deliveryFee = 0;
      deliveryRuleReason = `Free Delivery (${dist} km is within ${freeKm} km free radius)`;
    } else if (freeKm > 0) {
      // Beyond free delivery radius: Max(minDeliveryCharge, (distance - freeDeliveryKmRadius) * deliveryChargePerKm)
      const chargeableDist = Math.max(0, dist - freeKm);
      const calculatedCharge = chargeableDist * chargePerKm;
      deliveryFee = Math.max(minCharge, calculatedCharge);
      isFreeDelivery = deliveryFee === 0;
      deliveryRuleReason = deliveryFee === 0
        ? "Free Delivery"
        : `₹${deliveryFee.toFixed(0)} (${chargeableDist.toFixed(1)} km chargeable @ ₹${chargePerKm}/km)`;
    } else {
      deliveryFee = minCharge;
      isFreeDelivery = deliveryFee === 0;
      deliveryRuleReason = deliveryFee === 0 ? "Free Delivery" : `Standard Delivery: ₹${minCharge}`;
    }

    return {
      storeId: store ? store.id : null,
      storeName: store ? store.name : "GroceryMart Central",
      storeAddress: store ? store.address : "",
      distanceKm: dist,
      freeDeliveryKmRadius: freeKm,
      deliveryChargePerKm: chargePerKm,
      minDeliveryCharge: minCharge,
      standardDeliveryFee: minCharge,
      calculatedDeliveryFee: deliveryFee,
      freeDeliveryThreshold,
      isFreeDelivery,
      deliveryRuleReason,
      taxRatePercent: 5.0,
      deliveryEnabled: store ? store.deliveryEnabled !== false : true,
      clickCollectEnabled: store ? store.clickCollectEnabled !== false : true,
    };
  }
}

export const customerStoresService = new CustomerStoresService();
