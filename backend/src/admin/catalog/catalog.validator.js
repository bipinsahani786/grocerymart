import { AppError } from "../../utils/AppError.js";

/**
 * Single Responsibility: Validation of Master Product and Category domain input schemas.
 */
export class CatalogValidator {
  static validateMasterProductData(data, isUpdate = false) {
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || !String(data.name).trim()) {
        throw new AppError('Product Title is required.', 400);
      }
    }
    if (!isUpdate || data.barcode !== undefined) {
      if (!data.barcode || !String(data.barcode).trim()) {
        throw new AppError('Barcode is required.', 400);
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
}
