import { prisma } from "../../../config/prisma.js";

export class StoresRepository {
  async findStores({ search = "", page = 1, limit = 10, status = "all", module = "all" } = {}) {
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.isActive = status === "active";
    }

    if (module !== "all") {
      if (module === "pos") where.posEnabled = true;
      if (module === "delivery") where.deliveryEnabled = true;
      if (module === "click_collect") where.clickCollectEnabled = true;
    }

    const skip = (page - 1) * limit;

    const [total, data] = await prisma.$transaction([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    return { total, data };
  }

  async createStore(data) {
    return await prisma.store.create({
      data,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async updateStore(id, data) {
    return await prisma.store.update({
      where: { id },
      data,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });
  }

  async updateStoreStatus(id, isActive) {
    return await prisma.store.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteStore(id) {
    return await prisma.store.delete({
      where: { id },
    });
  }
}

export const storesRepository = new StoresRepository();
