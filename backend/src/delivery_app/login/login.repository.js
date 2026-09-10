import { prisma } from "../../../config/prisma.js";

export class LoginRepository {
  /**
   * Find user by phone including user role and deliveryProfile (Rider)
   */
  async findUserWithPartnerByPhone(phone) {
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
   * Update partner active / online status
   */
  async updatePartnerOnline(userId, isOnline) {
    return await prisma.rider.updateMany({
      where: { userId },
      data: { isOnline },
    });
  }
}

export const loginRepository = new LoginRepository();
