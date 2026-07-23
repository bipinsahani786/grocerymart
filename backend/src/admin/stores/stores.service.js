import bcrypt from "bcrypt";
import { prisma } from "../../../config/prisma.js";
import { storesRepository } from "./stores.repository.js";
import { AppError } from "../../utils/AppError.js";

export class StoresService {
  async getStores(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;

    const { total, data } = await storesRepository.findStores({
      search: query.search || "",
      page,
      limit,
      status: query.status || "all",
      module: query.module || "all",
    });

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Stores retrieved successfully",
    };
  }

  async updateStore(id, payload) {
    const store = await storesRepository.updateStore(id, payload);
    return {
      success: true,
      data: store,
      message: "Store updated successfully",
    };
  }

  async updateStoreStatus(id, isActive) {
    const store = await storesRepository.updateStoreStatus(id, isActive);
    return {
      success: true,
      data: store,
      message: `Store marked as ${isActive ? 'Active' : 'Inactive'}`,
    };
  }

  async createStore(payload) {
    // We must use a transaction to ensure both user and store are created successfully.
    // If anything fails, it rolls back.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if email or phone already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { email: payload.managerEmail },
            { phone: payload.managerPhone }
          ]
        }
      });

      if (existingUser) {
        throw new AppError("Manager email or phone already exists in the system", 400);
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(payload.managerPassword, 10);

      // 3. Create Store Manager User
      const manager = await tx.user.create({
        data: {
          name: payload.managerName,
          email: payload.managerEmail,
          phone: payload.managerPhone,
          passwordHash: passwordHash,
          status: "active",
          role: {
            create: {
              roleName: "store_manager"
            }
          }
        }
      });

      // 4. Create the Store and assign manager
      const store = await tx.store.create({
        data: {
          name: payload.name,
          address: payload.address,
          lat: payload.lat,
          long: payload.long,
          radiusKm: payload.radiusKm ?? 3,
          phone: payload.phone || null,
          gstin: payload.gstin || null,
          openingTime: payload.openingTime || "08:00",
          closingTime: payload.closingTime || "22:00",
          isActive: payload.isActive ?? true,
          posEnabled: payload.posEnabled ?? true,
          deliveryEnabled: payload.deliveryEnabled ?? true,
          clickCollectEnabled: payload.clickCollectEnabled ?? true,
          managerId: manager.id,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            }
          },
          _count: {
            select: { users: true }
          }
        }
      });

      // 5. Update the manager to belong to this store
      await tx.user.update({
        where: { id: manager.id },
        data: { storeId: store.id }
      });

      return store;
    });

    return {
      success: true,
      data: result,
      message: "Franchise Store and Manager created successfully",
    };
  }
}

export const storesService = new StoresService();
