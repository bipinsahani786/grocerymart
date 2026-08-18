import { prisma } from "../../../config/prisma.js";

export class CustomerStoresRepository {
  async findStoreByPincode(pincode) {
    let store = null;
    const cleanPin = String(pincode || "").trim();

    if (cleanPin) {
      store = await prisma.store.findFirst({
        where: {
          address: { contains: cleanPin, mode: "insensitive" },
          isActive: true,
        },
      });
    }

    if (!store) {
      store = await prisma.store.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });
    }

    return store;
  }

  async findAllActiveStores() {
    return await prisma.store.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export const customerStoresRepository = new CustomerStoresRepository();
