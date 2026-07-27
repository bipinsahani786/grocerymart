import { prisma } from "../../../config/prisma.js";

export class TaxesRepository {
  async getAllTaxClasses() {
    return await prisma.taxClass.findMany({
      include: {
        rates: {
          include: { components: true },
          orderBy: { effectiveFrom: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTaxClassById(id) {
    return await prisma.taxClass.findUnique({
      where: { id },
      include: {
        rates: {
          include: { components: true },
          orderBy: { effectiveFrom: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async createTaxClass(data, initialRateData) {
    return await prisma.$transaction(async (tx) => {
      const taxClass = await tx.taxClass.create({
        data: {
          name: data.name,
          description: data.description,
        }
      });

      if (initialRateData) {
        await tx.taxRate.create({
          data: {
            taxClassId: taxClass.id,
            effectiveFrom: initialRateData.effectiveFrom,
            components: {
              create: initialRateData.components
            }
          }
        });
      }

      return await tx.taxClass.findUnique({
        where: { id: taxClass.id },
        include: { rates: { include: { components: true } } }
      });
    });
  }

  async updateTaxClass(id, data) {
    return await prisma.taxClass.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        rates: {
          include: { components: true },
          orderBy: { effectiveFrom: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async deleteTaxClass(id) {
    return await prisma.taxClass.delete({
      where: { id }
    });
  }

  async scheduleTaxRate(taxClassId, rateData) {
    return await prisma.taxRate.create({
      data: {
        taxClassId,
        effectiveFrom: rateData.effectiveFrom,
        components: {
          create: rateData.components
        }
      },
      include: {
        components: true
      }
    });
  }
}

export const taxesRepository = new TaxesRepository();
