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

  validateMasterProductData(data, isUpdate = false) {
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || !String(data.name).trim()) {
        throw new AppError('Product Title is required.', 400);
      }
    }
    if (!isUpdate || data.brand !== undefined) {
      if (!data.brand || !String(data.brand).trim()) {
        throw new AppError('Brand Name is required.', 400);
      }
    }
    if (!isUpdate || data.categoryId !== undefined) {
      if (!data.categoryId) {
        throw new AppError('Master Category is required.', 400);
      }
    }
    if (data.productType === 'simple' || data.productType === 'loose') {
      if (!isUpdate || data.unit !== undefined) {
        if (!data.unit || !String(data.unit).trim()) {
          throw new AppError('Measuring Unit is required.', 400);
        }
      }
      if (!isUpdate || data.basePrice !== undefined) {
        if (data.basePrice === undefined || data.basePrice === null || Number(data.basePrice) <= 0) {
          throw new AppError('Base Price (₹) is required and must be greater than 0.', 400);
        }
      }
      if (!isUpdate || data.mrp !== undefined) {
        if (data.mrp === undefined || data.mrp === null || Number(data.mrp) <= 0) {
          throw new AppError('MRP (Maximum Retail Price) is required and must be greater than 0.', 400);
        }
      }
    }
  }

  async createMasterProduct(data) {
    try {
      this.validateMasterProductData(data, false);
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
      this.validateMasterProductData(data, true);
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
