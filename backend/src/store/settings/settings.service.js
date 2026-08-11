import { settingsRepository } from "./settings.repository.js";
import { resolveStoreId } from "../shared.js";

export class SettingsService {
  async getSettings(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await settingsRepository.getStoreSettings(storeId);
    return { success: true, data };
  }

  async updateSettings(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await settingsRepository.updateStoreSettings(storeId, payload);
    return { success: true, data, message: "Store settings updated successfully" };
  }
}

export const settingsService = new SettingsService();
