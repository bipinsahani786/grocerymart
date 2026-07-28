import { prisma } from "../../../config/prisma.js";

export class AuthRepository {
  async findUserByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async findUserByEmailWithUsage(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async findUserByPhoneWithUsage(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async createUser(userData, roleName, storeId = null) {
    // Uses nested writes to create User and UserRole simultaneously
    const data = {
      ...userData,
      role: {
        create: {
          roleName: roleName,
        }
      }
    };
    if (storeId) {
      data.storeId = storeId;
    }

    return await prisma.user.create({ 
      data,
      include: { role: true, store: true, managedStore: true }
    });
  }

  async updateUserStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async getUserProfile(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { role: true, store: true, managedStore: true },
    });
  }

  async updatePassword(id, passwordHash) {
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateUser(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      include: { role: true, store: true, managedStore: true },
    });
  }
}

export const authRepository = new AuthRepository();
