import { customerAddressesRepository } from "./addresses.repository.js";

export class CustomerAddressesService {
  async getProfile(currentUser, query = {}) {
    const userId = currentUser?.id || query.userId;
    const phone = currentUser?.phone || query.phone;
    const email = currentUser?.email || query.email;

    const user = await customerAddressesRepository.findUser({ userId, phone, email });

    if (!user) {
      return {
        id: null,
        name: "Guest",
        phone: null,
        email: null,
        walletBalance: 0,
        loyaltyPoints: 0,
        ordersCount: 0,
        addressesCount: 0,
        savedItemsCount: 0,
      };
    }

    const ordersCount = await customerAddressesRepository.countCustomerOrders(user.id);
    const addressesCount = await customerAddressesRepository.countCustomerAddresses(user.id);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      walletBalance: user.walletBalance || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
      ordersCount,
      addressesCount,
      savedItemsCount: 0,
    };
  }

  async getAddresses(currentUser, query = {}) {
    const userId = currentUser?.id || query.userId;
    if (!userId) return [];
    return await customerAddressesRepository.getCustomerAddresses(userId);
  }

  async addAddress(currentUser, data = {}) {
    const userId = currentUser?.id || data.userId;
    if (!userId) {
      throw new Error("Authentication required: Please login to save an address.");
    }

    return await customerAddressesRepository.createAddress(userId, data);
  }

  async updateAddress(id, data) {
    return await customerAddressesRepository.updateAddress(id, data);
  }

  async deleteAddress(id) {
    return await customerAddressesRepository.deleteAddress(id);
  }
}

export const customerAddressesService = new CustomerAddressesService();
