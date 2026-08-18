import { prisma } from "../../../config/prisma.js";

export class CustomerAddressesRepository {
  async getOrCreateCustomer(phone) {
    const userPhone = phone || "9876543210";
    let user = await prisma.user.findFirst({
      where: { phone: userPhone },
      include: { addresses: true, orders: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: userPhone,
          name: "Customer",
          walletBalance: 0.0,
          loyaltyPoints: 0,
          status: "active",
        },
        include: { addresses: true, orders: true },
      });
    }

    return user;
  }

  async getCustomerAddresses(userId) {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createAddress(userId, { street, city, state, zipCode }) {
    return await prisma.address.create({
      data: {
        userId,
        street,
        city: city || "Noida",
        state: state || "Uttar Pradesh",
        zipCode,
      },
    });
  }

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

  async deleteAddress(id) {
    return await prisma.address.delete({
      where: { id },
    });
  }

  async countCustomerOrders(customerId) {
    return await prisma.order.count({
      where: { customerId },
    });
  }

  async countCustomerAddresses(userId) {
    return await prisma.address.count({
      where: { userId },
    });
  }
}

export const customerAddressesRepository = new CustomerAddressesRepository();
