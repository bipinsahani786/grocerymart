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
}

export const managersService = new ManagersService();
