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
