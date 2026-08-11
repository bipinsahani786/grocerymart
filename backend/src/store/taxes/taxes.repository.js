import { prisma } from "../../../config/prisma.js";

export class TaxesRepository {
  async getTaxes() {
    return await prisma.taxClass.findMany({
      where: { isActive: true },
      include: {
        rates: {
          include: { components: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const taxesRepository = new TaxesRepository();
