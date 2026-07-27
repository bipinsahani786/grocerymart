import { taxesRepository } from "./taxes.repository.js";
import { AppError } from "../../utils/AppError.js";

export class TaxesService {
  async getAllTaxClasses() {
    const classes = await taxesRepository.getAllTaxClasses();
    
    // Compute current active rate for each class
    const now = new Date();
    
    return classes.map(tc => {
      // Find the first rate where effectiveFrom <= now (since they are ordered desc)
      const currentRate = tc.rates.find(r => new Date(r.effectiveFrom) <= now) || null;
      let currentTotalRate = 0;
      
      if (currentRate) {
        currentTotalRate = currentRate.components.reduce((sum, c) => sum + c.rate, 0);
      }
      
      return {
        ...tc,
        currentActiveRate: currentRate,
        currentTotalRate
      };
    });
  }

  async createTaxClass(data) {
    try {
      const { initialRate, ...classData } = data;
      const result = await taxesRepository.createTaxClass(classData, initialRate);
      return {
        success: true,
        data: result,
        message: "Tax class created successfully"
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError("Tax class with this name already exists", 400);
      }
      throw error;
    }
  }

  async updateTaxClass(id, data) {
    const taxClass = await taxesRepository.getTaxClassById(id);
    if (!taxClass) {
      throw new AppError("Tax class not found", 404);
    }

    try {
      const result = await taxesRepository.updateTaxClass(id, data);
      return {
        success: true,
        data: result,
        message: "Tax class updated successfully"
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError("Tax class with this name already exists", 400);
      }
      throw error;
    }
  }

  async deleteTaxClass(id) {
    const taxClass = await taxesRepository.getTaxClassById(id);
    if (!taxClass) {
      throw new AppError("Tax class not found", 404);
    }

    if (taxClass._count && taxClass._count.products > 0) {
      throw new AppError(
        `Cannot delete tax class "${taxClass.name}" because it is currently assigned to ${taxClass._count.products} product(s). Please reassign those products first.`,
        400
      );
    }

    await taxesRepository.deleteTaxClass(id);
    return {
      success: true,
      message: "Tax class deleted successfully"
    };
  }

  async scheduleTaxRate(taxClassId, data) {
    const result = await taxesRepository.scheduleTaxRate(taxClassId, data);
    return {
      success: true,
      data: result,
      message: "Tax rate scheduled successfully"
    };
  }
}

export const taxesService = new TaxesService();
