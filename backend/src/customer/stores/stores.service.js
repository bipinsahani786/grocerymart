import { customerStoresRepository } from "./stores.repository.js";

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

  async getStores(pincode = "") {
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
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        distance: isDirectMatch ? "0.8 km away (Nearest Hub)" : `${(1.2 + index * 1.5).toFixed(1)} km away`,
        readyTime: isDirectMatch ? "Ready in 8-10 mins" : "Ready in 15-20 mins",
        openingTime: s.openingTime,
        closingTime: s.closingTime,
      };
    });
  }
}

export const customerStoresService = new CustomerStoresService();
