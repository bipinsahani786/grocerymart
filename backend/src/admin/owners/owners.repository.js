import { prisma } from "../../../config/prisma.js";

export class OwnersRepository {
  async findAllOwners(page = 1, limit = 10, search = "", status = "") {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const where = { userType: "owner" };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          userType: true,
          walletBalance: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          ownerProfile: {
            select: {
              ownerType: true,
              gstNumber: true,
              verificationStatus: true,
              strikeCount: true,
              accountHolderName: true,
              bankAccount: true,
              bankIfsc: true,
              globalTermsAccepted: true,
              globalTermsAcceptedAt: true,
              globalTermsVersion: true,
            },
          },
          parkings: {
            select: {
              id: true,
              ownerId: true,
              name: true,
              parkingType: true,
              address: true,
              latitude: true,
              longitude: true,
              photos: true,
              openTime: true,
              closeTime: true,
              is24hr: true,
              status: true,
              avgRating: true,
              addonsEnabled: true,
              isFull: true,
              isClosed: true,
              reopenAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },

          _count: {
            select: { parkings: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parsedLimit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async findOwnerFullDetails(ownerId) {
    return await prisma.user.findUnique({
      where: { id: ownerId },
      include: {
        ownerProfile: true,
        parkings: {
          include: {
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
                vehicleType: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                user: { select: { name: true, phone: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 50,
            },
            _count: {
              select: { bookings: true },
            },
          },
        },
        walletTxns: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findOwnerProfiles(page = 1, limit = 10, search = "", status = "") {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) {
      where.verificationStatus = status;
    }
    if (search) {
      where.OR = [
        { gstNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.ownerProfile.findMany({
        where,
        include: {
          user: {
            select: { name: true, phone: true, email: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ownerProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOwnerProfileById(ownerId) {
    return await prisma.ownerProfile.findUnique({
      where: { userId: ownerId },
      include: { user: true },
    });
  }

  async updateOwnerKycStatus(ownerId, status) {
    return await prisma.ownerProfile.update({
      where: { userId: ownerId },
      data: { verificationStatus: status },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
    });
  }

  async clearKycDetails(ownerId) {
    return await prisma.ownerProfile.update({
      where: { userId: ownerId },
      data: {
        aadharNumber: null,
        aadharPic: null,
        bankAccount: null,
        bankIfsc: null,
        accountHolderName: null,
      },
    });
  }

  async disableOwnerAndParkings(ownerId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: ownerId },
        data: { status: "suspended" },
      });

      await tx.parking.updateMany({
        where: { ownerId },
        data: { status: "paused" },
      });

      return user;
    });
  }

  async enableOwnerAndParkings(ownerId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: ownerId },
        data: { status: "active" },
      });

      await tx.parking.updateMany({
        where: { ownerId, status: "paused" },
        data: { status: "active" },
      });

      return user;
    });
  }

  async directOnboardOwnerTransaction(userData, ownerType, gstNumber) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          passwordHash: userData.passwordHash,
          userType: "owner",
          status: "active",
        },
      });

      const profile = await tx.ownerProfile.create({
        data: {
          userId: user.id,
          ownerType,
          gstNumber,
          verificationStatus: "approved",
        },
      });

      return { user, profile };
    });
  }

  async deleteOwner(ownerId) {
    return await prisma.user.delete({
      where: { id: ownerId },
    });
  }

  async updateOwner(ownerId, data) {
    const { 
      name, email, phone, status, 
      company, gstNumber, verificationStatus, strikeCount,
      walletBalance, bankDetails 
    } = data;

    return await prisma.user.update({
      where: { id: ownerId },
      data: {
        name,
        email,
        phone,
        status,
        walletBalance: walletBalance !== undefined && walletBalance !== "" ? parseFloat(walletBalance) : undefined,
        ownerProfile: {
          update: {
            ownerType: company,
            gstNumber,
            verificationStatus,
            strikeCount: strikeCount !== undefined && strikeCount !== "" ? parseInt(strikeCount) : undefined,
            accountHolderName: bankDetails?.holder,
            bankAccount: bankDetails?.account,
            bankIfsc: bankDetails?.ifsc,
          },
        },
      },
    });
  }


  async findUsers(filters) {

    return await prisma.user.findMany({
      where: filters,
      select: { id: true, name: true, email: true, phone: true, userType: true, createdAt: true, status: true },
    });
  }

  async getDashboardStats() {
    const [totalOwners, totalDrivers, recentOwners, recentDrivers] = await Promise.all([
      prisma.user.count({ where: { userType: "owner" } }),
      prisma.user.count({ where: { userType: "driver" } }),
      prisma.user.findMany({
        where: { userType: "owner" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          _count: { select: { parkings: true } }
        }

      }),
      prisma.user.findMany({
        where: { userType: "driver" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    return {
      totalOwners,
      totalDrivers,
      recentOwners,
      recentDrivers
    };
  }
}


export const ownersRepository = new OwnersRepository();
