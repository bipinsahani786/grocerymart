import { prisma } from "../../../config/prisma.js";

export class AuthRepository {
  async findUserByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmailWithUsage(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByPhoneWithUsage(phone) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async createUser(userData) {
    return await prisma.user.create({ data: userData });
  }

  async updateUserStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  // createOwnerProfile is removed as ownerProfile model doesn't exist

  async getUserProfile(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePassword(id, passwordHash) {
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();
