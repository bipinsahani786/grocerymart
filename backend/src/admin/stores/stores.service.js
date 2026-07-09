import { storesRepository } from "./stores.repository.js";

export class StoresService {
  async getStores(query) {
    const data = await storesRepository.findStores({ search: query.search || "" });
    return {
      success: true,
      data,
      message: "Stores retrieved successfully",
    };
  }

  async createStore(payload) {
    const data = await storesRepository.createStore({
      name: payload.name,
      address: payload.address,
      lat: payload.lat,
      long: payload.long,
      radiusKm: payload.radiusKm ?? 3,
      phone: payload.phone || null,
      gstin: payload.gstin || null,
      openingTime: payload.openingTime || "08:00",
      closingTime: payload.closingTime || "22:00",
      isActive: payload.isActive ?? true,
      posEnabled: payload.posEnabled ?? true,
      deliveryEnabled: payload.deliveryEnabled ?? true,
      clickCollectEnabled: payload.clickCollectEnabled ?? true,
    });

    return {
      success: true,
      data,
      message: "Store created successfully",
    };
  }
}

export const storesService = new StoresService();
