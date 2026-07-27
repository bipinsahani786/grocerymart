import { prisma } from '../../../config/prisma.js';

export class CatalogRepository {
  async getMasterCategories() {
    // Fetch all categories and build a tree, or just fetch flat and let frontend build tree
    // For now, let's fetch all with their parent info
    return await prisma.masterCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createMasterCategory(data) {
    return await prisma.masterCategory.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder || 0,
      }
    });
  }

  async updateMasterCategory(id, data) {
    return await prisma.masterCategory.update({
      where: { id },
      data: {
        name: data.name,
        parentId: data.parentId !== undefined ? (data.parentId || null) : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
      }
    });
  }

  async deleteMasterCategory(id) {
    return await prisma.masterCategory.delete({
      where: { id }
    });
  }

  async getMasterProducts(filters) {
    const where = {};
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.productType) {
      where.productType = filters.productType;
    }

    return await prisma.masterProduct.findMany({
      where,
      include: {
        category: true,
        variants: true,
        taxClass: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createMasterProduct(data) {
    const { variants, ...productData } = data;

    return await prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.create({
        data: {
          ...productData,
          variants: variants && variants.length > 0 ? {
            create: variants
          } : undefined
        },
        include: {
          variants: true
        }
      });
      return product;
    });
  }
}

export const catalogRepository = new CatalogRepository();
