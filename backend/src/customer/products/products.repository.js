import { prisma } from "../../../config/prisma.js";

export class CustomerProductsRepository {
  /**
   * Resolves the active store delivering to a given pincode, or defaults to the primary active store.
   */
  async findServingStore(pincode) {
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

    if (!store && cleanPin) {
      store = await prisma.store.findFirst({
        where: {
          OR: [
            { name: { contains: cleanPin, mode: "insensitive" } },
            { address: { contains: cleanPin, mode: "insensitive" } },
          ],
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

  async findStoreById(storeId) {
    if (!storeId) return null;
    return await prisma.store.findFirst({
      where: { id: storeId, isActive: true },
    });
  }

  /**
   * Fetches active categories with live product count for a given store.
   */
  async findCategoriesByStore(storeId) {
    let categories = [];

    if (storeId) {
      categories = await prisma.category.findMany({
        where: {
          storeId,
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
    }

    if (categories.length === 0) {
      categories = await prisma.category.findMany({
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
    let categoryFilter = {};
    if (category && category !== "all") {
      const cleanCat = category.trim().toLowerCase();
      const searchWords = cleanCat.split(/[-_\s&]+/).filter(w => w.length > 2);
      
      categoryFilter = {
        OR: [
          { categoryId: category },
          {
            category: {
              OR: [
                { name: { contains: cleanCat, mode: "insensitive" } },
                ...searchWords.map((word) => ({
                  name: { contains: word, mode: "insensitive" },
                })),
                ...(cleanCat.includes("fresh") || cleanCat.includes("fruit") || cleanCat.includes("veg")
                  ? [
                      { name: { contains: "fruit", mode: "insensitive" } },
                      { name: { contains: "vegetable", mode: "insensitive" } },
                    ]
                  : []),
                ...(cleanCat.includes("dairy") || cleanCat.includes("milk") || cleanCat.includes("egg")
                  ? [
                      { name: { contains: "dairy", mode: "insensitive" } },
                      { name: { contains: "egg", mode: "insensitive" } },
                    ]
                  : []),
                ...(cleanCat.includes("snack") || cleanCat.includes("namkeen")
                  ? [
                      { name: { contains: "snack", mode: "insensitive" } },
                      { name: { contains: "namkeen", mode: "insensitive" } },
                    ]
                  : []),
                ...(cleanCat.includes("clean") || cleanCat.includes("household")
                  ? [
                      { name: { contains: "clean", mode: "insensitive" } },
                      { name: { contains: "household", mode: "insensitive" } },
                    ]
                  : []),
              ],
            },
          },
        ],
      };
    }

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
        ...categoryFilter,
      },
      include: {
        category: true,
        inventory: true,
        variants: true,
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
      orderBy: {
        salesCount: "desc",
      },
    });
  }
}

export const customerProductsRepository = new CustomerProductsRepository();
