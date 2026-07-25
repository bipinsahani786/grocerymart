import { prisma } from "../../../config/prisma.js";

const managerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  managedStore: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  role: {
    select: {
      roleName: true,
    },
  },
};

export class ManagersRepository {
  async findManagers({ search = "" } = {}) {
    const where = {
      role: { roleName: "store_manager" },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.user.findMany({
      where,
      select: managerSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findManagerByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
  }

  async createManager(userData, storeId = null) {
    return await prisma.$transaction(async (tx) => {
      const manager = await tx.user.create({
        data: {
          ...userData,
          storeId,
          role: {
            create: {
              roleName: "store_manager",
            },
          },
        },
        select: managerSelect,
      });

      if (storeId) {
        await tx.store.update({
          where: { id: storeId },
          data: { managerId: manager.id },
        });
      }

      return await tx.user.findUnique({
        where: { id: manager.id },
        select: managerSelect,
      });
    });
  }

  async updateManager(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      select: managerSelect,
    });
  }

  async updateManagerProfile(id, userData, newStoreId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update the user data
      const updateData = { ...userData };
      
      // If storeId is explicitly passed (even as null)
      if (newStoreId !== undefined) {
        updateData.storeId = newStoreId;
      }

      const manager = await tx.user.update({
        where: { id },
        data: updateData,
        select: managerSelect,
      });

      // 2. Handle Store Re-assignment if newStoreId was explicitly provided
      if (newStoreId !== undefined) {
        // Remove manager from any store they currently manage
        await tx.store.updateMany({
          where: { managerId: id },
          data: { managerId: null },
        });

        // Assign to the new store, if not null
        if (newStoreId !== null) {
          await tx.store.update({
            where: { id: newStoreId },
            data: { managerId: id },
          });
        }
      }

      // 3. Return the fully updated manager
      return await tx.user.findUnique({
        where: { id },
        select: managerSelect,
      });
    });
  }
}

export const managersRepository = new ManagersRepository();
