import { usersRepository } from "./users.repository.js";

export class UsersService {
  async getUsers(query) {
    const filters = {};
    if (query.userType) filters.userType = query.userType;
    if (query.status) filters.status = query.status;

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || "";

    return await usersRepository.findUsers(filters, page, limit, search);
  }

  async updateUserStatus(id, status) {
    const updated = await usersRepository.updateUserStatus(id, status);
    return {
      success: true,
      data: updated,
      message: `User status updated to '${status}'`,
    };
  }

  async updateUser(id, data) {
    const updated = await usersRepository.updateUser(id, data);
    return {
      success: true,
      data: updated,
      message: "User profile updated successfully",
    };
  }

  async deleteUser(id) {
    await usersRepository.deleteUser(id);
    return {
      success: true,
      message: "User deleted successfully",
    };
  }
}


export const usersService = new UsersService();
