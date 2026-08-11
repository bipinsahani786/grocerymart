import { customersRepository } from "./customers.repository.js";
import { AppError } from "../../utils/AppError.js";
import { resolveStoreId } from "../shared.js";

export class CustomersService {
  async getCustomers(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await customersRepository.getCustomers(storeId);
    return { success: true, data };
  }

  async createCustomer(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);

    const name = payload.name?.trim();
    const phone = payload.phone?.trim();
    const email = payload.email?.trim() || null;

    if (!name || name.length < 2) {
      throw new AppError("Customer name must be at least 2 characters long", 400);
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      throw new AppError("Valid 10-digit mobile phone number is compulsory", 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("Invalid email address format", 400);
    }

    const data = await customersRepository.createCustomer(storeId, {
      name,
      phone,
      email,
      notes: payload.notes?.trim() || null,
      khataBalance: parseFloat(payload.khataBalance) || 0,
      loyaltyPoints: parseInt(payload.loyaltyPoints) || 0,
    });

    return { success: true, data, message: "Customer created successfully" };
  }

  async updateCustomer(user, storeIdParam, customerId, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);

    const updateData = {};
    if (payload.name !== undefined) {
      const name = payload.name?.trim();
      if (!name || name.length < 2) {
        throw new AppError("Customer name must be at least 2 characters long", 400);
      }
      updateData.name = name;
    }

    if (payload.phone !== undefined) {
      const phone = payload.phone?.trim();
      if (!phone || !/^\d{10}$/.test(phone)) {
        throw new AppError("Valid 10-digit mobile phone number is compulsory", 400);
      }
      updateData.phone = phone;
    }

    if (payload.email !== undefined) {
      const email = payload.email?.trim() || null;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("Invalid email address format", 400);
      }
      updateData.email = email;
    }

    if (payload.khataBalance !== undefined) {
      updateData.khataBalance = parseFloat(payload.khataBalance) || 0;
    }
    if (payload.loyaltyPoints !== undefined) {
      updateData.loyaltyPoints = parseInt(payload.loyaltyPoints) || 0;
    }
    if (payload.notes !== undefined) {
      updateData.notes = payload.notes?.trim() || null;
    }

    const data = await customersRepository.updateCustomer(storeId, customerId, updateData);
    return { success: true, data, message: "Customer updated successfully" };
  }

  async deleteCustomer(user, storeIdParam, customerId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await customersRepository.deleteCustomer(storeId, customerId);
    return { success: true, message: "Customer deleted successfully" };
  }
}

export const customersService = new CustomersService();
