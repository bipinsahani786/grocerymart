import bcrypt from "bcrypt";
import { managersRepository } from "./managers.repository.js";

export class ManagersService {
  async getManagers(query) {
    const data = await managersRepository.findManagers({ search: query.search || "" });
    return {
      success: true,
      data,
      message: "Store managers retrieved successfully",
    };
  }

  async createManager(payload) {
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const data = await managersRepository.createManager(
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        passwordHash,
        status: "active",
      },
      payload.storeId || null
    );

    return {
      success: true,
      data,
      message: "Store manager created successfully",
    };
  }

  async updateManagerStatus(id, status) {
    const data = await managersRepository.updateManager(id, { status });
    return {
      success: true,
      data,
      message: `Store manager status updated to ${status}`,
    };
  }

  async updateManagerPassword(id, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const data = await managersRepository.updateManager(id, { passwordHash });
    return {
      success: true,
      data,
      message: "Store manager password updated successfully",
    };
  }
}

export const managersService = new ManagersService();
