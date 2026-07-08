import { settingsRepository } from "./settings.repository.js";

export class SettingsService {
  async getPlatformSettings() {
    const setting = await settingsRepository.getPlatformSettings();
    return {
      success: true,
      data: setting.value,
      message: "Platform global configuration retrieved successfully",
    };
  }

  async updatePlatformSettings(settingsData) {
    const setting = await settingsRepository.updatePlatformSettings(settingsData);
    return {
      success: true,
      data: setting.value,
      message: "Platform global configuration updated successfully",
    };
  }
}

export const settingsService = new SettingsService();
