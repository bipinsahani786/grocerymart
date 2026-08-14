import { catalogRepository } from './catalog.repository.js';
import { CatalogValidator } from './catalog.validator.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Single Responsibility: Master Catalog business logic and data orchestration.
 */
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

  async updateMasterCategory(id, data) {
    try {
      const result = await catalogRepository.updateMasterCategory(id, data);
      return {
        success: true,
        data: result,
        message: 'Master category updated successfully'
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Master category with this name already exists', 400);
      }
      if (error.code === 'P2025') {
        throw new AppError('Master category not found', 404);
      }
      throw error;
    }
  }

  async deleteMasterCategory(id) {
    try {
      await catalogRepository.deleteMasterCategory(id);
      return {
        success: true,
        message: 'Master category deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Master category not found', 404);
      }
      if (error.code === 'P2003') {
        throw new AppError('Cannot delete category with active child categories or products', 400);
      }
      throw error;
    }
  }

  async getMasterProducts(filters) {
    return await catalogRepository.getMasterProducts(filters);
  }

  async createMasterProduct(data) {
    try {
      CatalogValidator.validateMasterProductData(data, false);
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

  async updateMasterProduct(id, data) {
    try {
      CatalogValidator.validateMasterProductData(data, true);
      const result = await catalogRepository.updateMasterProduct(id, data);
      return {
        success: true,
        data: result,
        message: 'Master product updated successfully'
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Master product with this SKU or Barcode already exists', 400);
      }
      if (error.code === 'P2025') {
        throw new AppError('Master product not found', 404);
      }
      throw error;
    }
  }

  async deleteMasterProduct(id) {
    try {
      await catalogRepository.deleteMasterProduct(id);
      return {
        success: true,
        message: 'Master product deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Master product not found', 404);
      }
      throw error;
    }
  }
}

export const catalogService = new CatalogService();
