import { prisma } from "../../../config/prisma.js";

export class ParkingsRepository {
  async findAllParkings(page = 1, limit = 10, search = '', status = '', parkingType = '', kycStatus = '') {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status && status !== 'All') {
      where.status = status.toLowerCase();
    }
    if (parkingType && parkingType !== 'All') {
      where.parkingType = parkingType;
    }
    if (kycStatus && kycStatus !== 'All') {
      where.kycStatus = kycStatus.toLowerCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.parking.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          slots: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit, 10)
      }),
      prisma.parking.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateParkingStatus(parkingId, status) {
    return await prisma.parking.update({
      where: { id: parkingId },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async updateParkingKycStatus(parkingId, kycStatus) {
    return await prisma.parking.update({
      where: { id: parkingId },
      data: { kycStatus },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async findParkingById(parkingId) {
    return await prisma.parking.findUnique({
      where: { id: parkingId },
    });
  }

  async findParkingFullDetails(parkingId) {
    return await prisma.parking.findUnique({
      where: { id: parkingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, status: true, walletBalance: true } },
        slots: true,
        pricingRules: true,
        customAddons: true,
        bookings: {
          select: {
            id: true,
            status: true,
            grossAmount: true,
            commission: true,
            ownerShare: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: {
          select: { bookings: true }
        }
      },
    });
  }
  async updateParking(parkingId, data) {
    if (data.ownershipType === 'owned') {
      data.leaseAgreement = null;
    } else if (data.ownershipType === 'rental') {
      data.propertyPaper = null;
    }

    const updated = await prisma.parking.update({
      where: { id: parkingId },
      data,
    });

    if (data.latitude !== undefined && data.longitude !== undefined) {
      await prisma.$executeRawUnsafe(`
        UPDATE parkings 
        SET location = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326) 
        WHERE id = '${parkingId}';
      `);
    }

    return updated;
  }

  async deleteParking(parkingId) {
    // Perform transaction to ensure related slots are deleted
    return await prisma.$transaction([
      prisma.parkingSlot.deleteMany({ where: { parkingId } }),
      prisma.parking.delete({ where: { id: parkingId } })
    ]);
  }
}

export const parkingsRepository = new ParkingsRepository();
