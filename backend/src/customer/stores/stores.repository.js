import { prisma } from "../../../config/prisma.js";

export class CustomerStoresRepository {
  async findStoreByPincode(pincode = "201301") {
    let store = await prisma.store.findFirst({
      where: {
        address: { contains: pincode },
        isActive: true,
      },
    });

    if (!store) {
      store = await prisma.store.findFirst({
        where: { isActive: true },
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
