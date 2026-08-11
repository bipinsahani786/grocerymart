import { prisma } from "../../../config/prisma.js";

export class SettingsRepository {
  async getStoreSettings(storeId) {
    return await prisma.store.findUnique({
      where: { id: storeId },
      include: { manager: true },
    });
  }

  async updateStoreSettings(storeId, data) {
    const updateData = { ...data };
    if (updateData.deliveryChargePerKm !== undefined) {
      updateData.deliveryChargePerKm = parseFloat(updateData.deliveryChargePerKm) || 0;
    }
    if (updateData.freeDeliveryKmRadius !== undefined) {
      updateData.freeDeliveryKmRadius = parseFloat(updateData.freeDeliveryKmRadius) || 0;
    }
    if (updateData.minDeliveryCharge !== undefined) {
      updateData.minDeliveryCharge = parseFloat(updateData.minDeliveryCharge) || 0;
    }
    if (updateData.radiusKm !== undefined) {
      updateData.radiusKm = parseFloat(updateData.radiusKm) || 0;
    }
    if (updateData.lat !== undefined) {
      updateData.lat = parseFloat(updateData.lat) || 0;
    }
    if (updateData.long !== undefined) {
      updateData.long = parseFloat(updateData.long) || 0;
    }

    return await prisma.store.update({
      where: { id: storeId },
      data: updateData,
      include: { manager: true },
    });
  }
}

export const settingsRepository = new SettingsRepository();
