import { prisma } from "../../../config/prisma.js";

export class CustomerProductsRepository {
  /**
   * Resolves the active store delivering to a given pincode or falls back to the default store.
   */
  async findServingStore(pincode = "201301") {
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

  /**
   * Fetches active products for a store with category and inventory relations.
   */
  async findProductsByStore(storeId, category = "all", searchQuery = "") {
    return await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        showOnApp: true,
        ...(searchQuery
          ? {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
                { brand: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(category && category !== "all"
          ? {
              category: {
                name: { contains: category, mode: "insensitive" },
              },
            }
          : {}),
      },
      include: {
        category: true,
        inventory: true,
      },
      orderBy: {
        salesCount: "desc",
      },
    });
  }
}

export const customerProductsRepository = new CustomerProductsRepository();
