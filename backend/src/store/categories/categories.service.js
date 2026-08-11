import { categoriesRepository } from "./categories.repository.js";
import { AppError } from "../../utils/AppError.js";
import { resolveStoreId } from "../shared.js";

export class CategoriesService {
  async getCategories(user, storeIdParam, filters) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await categoriesRepository.getCategories(storeId, filters);
    return { success: true, data };
  }

  async createCategory(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    if (!payload.name || !payload.name.trim()) {
      throw new AppError("Category name is required", 400);
    }
    const data = await categoriesRepository.createCategory(storeId, payload);
    return { success: true, data, message: "Category created successfully" };
  }

  async updateCategory(user, storeIdParam, categoryId, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await categoriesRepository.updateCategory(categoryId, storeId, payload);
    return { success: true, data, message: "Category updated successfully" };
  }

  async deleteCategory(user, storeIdParam, categoryId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await categoriesRepository.deleteCategory(categoryId, storeId);
    return { success: true, message: "Category deleted successfully" };
  }

  async importMasterCategories(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await categoriesRepository.importMasterCategories(storeId);
    return {
      success: true,
      data,
      message: `Successfully imported ${data.importedCount} of ${data.totalMaster} categories from Master list.`
    };
  }
}

export const categoriesService = new CategoriesService();
