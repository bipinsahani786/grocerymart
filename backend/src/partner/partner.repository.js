import { prisma } from "../../config/prisma.js";

export class PartnerRepository {
  /**
   * Find user by phone including user role and delivery profile (Rider)
   */
  async findUserByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      include: {
        role: true,
        deliveryProfile: {
          include: {
            stores: {
              include: { store: true },
            },
          },
        },
      },
    });
  }

  /**
   * Find rider profile by user ID
   */
  async findPartnerByUserId(userId) {
    return await prisma.rider.findUnique({
      where: { userId },
      include: {
        user: {
          include: { role: true },
        },
        stores: {
          include: { store: true },
        },
      },
    });
  }

  /**
   * Create a new delivery partner user in a single transactional write
   * Creates User -> UserRole (Role.DELIVERY_PARTNER) -> Rider (riders table)
   */
  async createPartnerUser({ phone, name, vehicleType = "EV_BIKE" }) {
    return await prisma.user.create({
      data: {
        phone,
        name: name || "Delivery Partner",
        status: "active",
        isActive: true,
        role: {
          create: {
            roleName: "delivery_partner",
            role: "DELIVERY_PARTNER",
          },
        },
        deliveryProfile: {
          create: {
            vehicleType: vehicleType || "EV_BIKE",
            kycStatus: "PENDING",
            isActive: true,
            rating: 5.0,
            totalDeliveries: 0,
            totalEarnings: 0.0,
          },
        },
      },
      include: {
        role: true,
        deliveryProfile: true,
      },
    });
  }

  /**
   * Ensure user has a rider profile row in riders table
   */
  async ensurePartnerProfile(userId, vehicleType = "EV_BIKE") {
    let partner = await prisma.rider.findUnique({
      where: { userId },
    });

    if (!partner) {
      partner = await prisma.rider.create({
        data: {
          userId,
          vehicleType,
          kycStatus: "PENDING",
          isActive: true,
        },
      });
    }

    return partner;
  }

  /**
   * Update rider details in the riders table
   */
  async updatePartner(userId, data) {
    return await prisma.rider.update({
      where: { userId },
      data,
      include: {
        user: {
          include: { role: true },
        },
        stores: {
          include: { store: true },
        },
      },
    });
  }

  /**
   * Update basic user details (name, email, avatar, etc.)
   */
  async updateUser(userId, data) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Get full rider profile by user ID
   */
  async getFullPartnerProfile(userId) {
    return await prisma.rider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            status: true,
            isActive: true,
            createdAt: true,
            role: true,
          },
        },
        stores: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }
}

export const partnerRepository = new PartnerRepository();
