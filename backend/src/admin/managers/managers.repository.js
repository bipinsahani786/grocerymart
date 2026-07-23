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
}

export const managersRepository = new ManagersRepository();
