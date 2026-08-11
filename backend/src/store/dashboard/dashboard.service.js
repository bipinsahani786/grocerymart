import { dashboardRepository } from "./dashboard.repository.js";
import { resolveStoreId } from "../shared.js";

export class DashboardService {
  async getDashboard(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await dashboardRepository.dashboard(storeId);
    return { success: true, data };
  }

  async getAnalytics(user, storeIdParam, range) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await dashboardRepository.analytics(storeId, range);
    return { success: true, data };
  }
}

export const dashboardService = new DashboardService();
