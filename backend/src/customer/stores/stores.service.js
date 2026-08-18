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

    return stores.map((s, index) => {
      const isDirectMatch = pincode && s.address.includes(pincode);
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        distance: isDirectMatch ? "0.8 km away (Nearest)" : `${(1.2 + index * 1.5).toFixed(1)} km away`,
        readyTime: "Ready in 10 mins",
        openingTime: s.openingTime,
        closingTime: s.closingTime,
      };
    });
  }
}

export const customerStoresService = new CustomerStoresService();
