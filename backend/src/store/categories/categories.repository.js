import { prisma } from "../../../config/prisma.js";

export class CategoriesRepository {
  async getCategories(storeId, filters = {}) {
    const { page, limit, search, parentId, all } = filters;

    // Check if store has 0 categories; if so, auto-import from Master Categories
    const categoryCount = await prisma.category.count({ where: { storeId } });
    if (categoryCount === 0) {
      await this.importMasterCategories(storeId);
    }

    // If 'all' flag is provided, return all categories (used for dropdowns & filters)
    if (all === 'true' || all === true) {
      const data = await prisma.category.findMany({
        where: { storeId },
        include: { _count: { select: { products: true } }, children: true, parent: true },
        orderBy: { sortOrder: "asc" },
      });
      return { data, meta: { total: data.length, page: 1, limit: Math.max(1, data.length), totalPages: 1 } };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (parentId !== undefined && parentId !== '' && parentId !== 'all') {
      if (parentId === 'not_null') {
        where.parentId = { not: null };
      } else if (parentId === 'null') {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } }, children: true, parent: true },
        orderBy: { sortOrder: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.category.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      }
    };
  }

  async createCategory(storeId, data) {
    return await prisma.category.create({
      data: {
        storeId,
        name: data.name,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
      },
    });
  }

  async updateCategory(categoryId, storeId, data) {
    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: parseInt(data.sortOrder) } : {}),
      },
    });
  }

  async deleteCategory(categoryId, storeId) {
    return await prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async importMasterCategories(storeId) {
    const masterCategories = await prisma.masterCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { parent: true }
    });

    let importedCount = 0;

    // First pass: create all categories (without parentId initially)
    for (const mc of masterCategories) {
      const existing = await prisma.category.findUnique({
        where: { storeId_name: { storeId, name: mc.name } },
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            storeId,
            name: mc.name,
            imageUrl: mc.imageUrl || null,
            sortOrder: mc.sortOrder || 0,
          },
        });
        importedCount++;
      }
    }

    // Second pass: link parent categories
    for (const mc of masterCategories) {
      if (mc.parentId && mc.parent) {
        const localParent = await prisma.category.findUnique({
          where: { storeId_name: { storeId, name: mc.parent.name } }
        });

        if (localParent) {
          await prisma.category.update({
            where: { storeId_name: { storeId, name: mc.name } },
            data: { parentId: localParent.id }
          });
        }
      }
    }

    return { importedCount, totalMaster: masterCategories.length };
  }
}

export const categoriesRepository = new CategoriesRepository();
