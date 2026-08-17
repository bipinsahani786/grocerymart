import { customerAddressesRepository } from "./addresses.repository.js";

export class CustomerAddressesService {
  async getProfile(phone) {
    const user = await customerAddressesRepository.getOrCreateCustomer(phone);
    const ordersCount = await customerAddressesRepository.countCustomerOrders(user.id);
    const addressesCount = await customerAddressesRepository.countCustomerAddresses(user.id);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      ordersCount,
      addressesCount,
      savedItemsCount: 8,
    };
  }

  async getAddresses(phone) {
    const user = await customerAddressesRepository.getOrCreateCustomer(phone);
    return await customerAddressesRepository.getCustomerAddresses(user.id);
  }

  async addAddress(phone, data) {
    const user = await customerAddressesRepository.getOrCreateCustomer(phone);
    return await customerAddressesRepository.createAddress(user.id, data);
  }

  async updateAddress(id, data) {
    return await customerAddressesRepository.updateAddress(id, data);
  }

  async deleteAddress(id) {
    return await customerAddressesRepository.deleteAddress(id);
  }
}

export const customerAddressesService = new CustomerAddressesService();
