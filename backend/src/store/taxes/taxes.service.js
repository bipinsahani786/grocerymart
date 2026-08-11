import { taxesRepository } from "./taxes.repository.js";
import { resolveStoreId } from "../shared.js";

export class TaxesService {
  async getTaxes(user, storeIdParam) {
    await resolveStoreId(user, storeIdParam);
    const data = await taxesRepository.getTaxes();
    return { success: true, data };
  }
}

export const taxesService = new TaxesService();
