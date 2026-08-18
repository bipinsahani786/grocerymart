import { prisma } from "../../../config/prisma.js";

export class CustomerProductsRepository {
  /**
   * Resolves the active store delivering to a given pincode, or defaults to the primary active store.
   */
  async findServingStore(pincode) {
    let store = null;

    if (pincode) {
      store = await prisma.store.findFirst({
        where: {
          address: { contains: String(pincode).trim() },
          isActive: true,
        },
      });
    }

    // Fallback directly to any active store in the database if no pincode given or no exact match
    if (!store) {
      store = await prisma.store.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });
    }

    return store;
  }

  /**
   * Fetches active categories with live product count for a given store.
   */
  async findCategoriesByStore(storeId) {
    let categories = await prisma.category.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        isActive: true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    if (categories.length === 0) {
      categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    }

    return categories;
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
              OR: [
                { categoryId: category },
                {
                  category: {
                    OR: [
                      { slug: { contains: category, mode: "insensitive" } },
                      { name: { contains: category, mode: "insensitive" } },
                    ],
                  },
                },
              ],
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
