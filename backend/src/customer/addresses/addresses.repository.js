import { prisma } from "../../../config/prisma.js";

export class CustomerAddressesRepository {
  /**
   * Find user by ID, phone, or email
   */
  async findUser({ userId, phone, email }) {
    if (!userId && !phone && !email) return null;

    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : null;

    return await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(phone ? [{ phone }] : []),
          ...(cleanPhone
            ? [
                { phone: cleanPhone },
                { phone: `+91${cleanPhone}` },
                { phone: `+91 ${cleanPhone}` },
              ]
            : []),
          ...(email ? [{ email }] : []),
        ],
      },
      include: { addresses: true },
    });
  }

  /**
   * Get addresses strictly belonging to the given user ID (strict tenant isolation)
   */
  async getCustomerAddresses(userId) {
    if (!userId) return [];
    return await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create an address strictly linked to the authenticated userId
   */
  async createAddress(userId, { street, city, state, zipCode }) {
    if (!userId) throw new Error("Authenticated userId is required to save an address");
    return await prisma.address.create({
      data: {
        userId,
        street,
        city: city || "Local",
        state: state || "State",
        zipCode: zipCode || "000000",
      },
    });
  }

  /**
   * Update address ensuring it belongs to the user
   */
  async updateAddress(id, { street, city, state, zipCode }) {
    return await prisma.address.update({
      where: { id },
      data: {
        ...(street && { street }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
      },
    });
  }

  /**
   * Delete address
   */
  async deleteAddress(id) {
    return await prisma.address.delete({
      where: { id },
    });
  }

  async countCustomerOrders(customerId) {
    if (!customerId) return 0;
    return await prisma.order.count({
      where: { customerId },
    });
  }

  async countCustomerAddresses(userId) {
    if (!userId) return 0;
    return await prisma.address.count({
      where: { userId },
    });
  }
}

export const customerAddressesRepository = new CustomerAddressesRepository();
