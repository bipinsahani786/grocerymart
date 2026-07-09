import { prisma } from "../../../config/prisma.js";

export class StoresRepository {
  async findStores({ search = "" } = {}) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return await prisma.store.findMany({
      where,
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
    });
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
}

export const storesRepository = new StoresRepository();
