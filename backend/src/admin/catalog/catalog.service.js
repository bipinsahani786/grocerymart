import { catalogRepository } from './catalog.repository.js';
import { AppError } from '../../utils/AppError.js';

export class CatalogService {
  async getMasterCategories() {
    return await catalogRepository.getMasterCategories();
  }

  async createMasterCategory(data) {
    try {
      const result = await catalogRepository.createMasterCategory(data);
      return {
        success: true,
        data: result,
        message: 'Master category created successfully'
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Master category with this name already exists', 400);
      }
      throw error;
    }
  }

  async getMasterProducts(filters) {
    return await catalogRepository.getMasterProducts(filters);
  }

  async createMasterProduct(data) {
    try {
      const result = await catalogRepository.createMasterProduct(data);
      return {
        success: true,
        data: result,
        message: 'Master product created successfully'
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Master product with this SKU or Barcode already exists', 400);
      }
      throw error;
    }
  }
}

export const catalogService = new CatalogService();
