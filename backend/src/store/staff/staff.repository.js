import { prisma } from "../../../config/prisma.js";
import { normalizeStaffRole } from "../../utils/roleUtils.js";

export class StaffRepository {
  async staff(storeId) {
    let storeStaffList = [];
    if (storeId) {
      storeStaffList = await prisma.storeStaff.findMany({
        where: { storeId },
        include: {
          user: true,
          shifts: { orderBy: { clockIn: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback: If no staff found for specific storeId, fetch all staff in system
    if (!storeStaffList || storeStaffList.length === 0) {
      storeStaffList = await prisma.storeStaff.findMany({
        include: {
          user: true,
          shifts: { orderBy: { clockIn: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    return storeStaffList.map((member) => {
      const totalOrders = (member.shifts || []).reduce((acc, s) => acc + (s.ordersCount || 0), 0);
      const totalRevenue = (member.shifts || []).reduce((acc, s) => acc + (s.revenue || 0), 0);
      const totalShifts = (member.shifts || []).length;

      return {
        id: member.id,
        name: member.name || member.user?.name || "Staff Member",
        email: member.email || member.user?.email || "",
        phone: member.phone || member.user?.phone || "",
        role: member.role || "CASHIER",
        shift: member.shift || "Morning",
        status: member.isActive ? "active" : "inactive",
        isActive: member.isActive !== false,
        pin: member.pin || member.user?.pin || "1234",
        createdAt: member.createdAt,
        joinedAt: member.joinedAt || member.createdAt,
        shifts: member.shifts || [],
        performance: {
          ordersProcessed: totalOrders,
          totalRevenue,
          totalShifts,
        },
      };
    });
  }

  async createStaff(storeId, userData) {
    let targetStoreId = storeId;
    if (!targetStoreId) {
      const firstStore = await prisma.store.findFirst();
      targetStoreId = firstStore?.id;
    }

    let userId = null;
    if (userData.phone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: userData.phone },
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const roleToSave = normalizeStaffRole(userData.role);

    return await prisma.storeStaff.create({
      data: {
        storeId: targetStoreId,
        userId,
        name: userData.name,
        email: userData.email || null,
        phone: userData.phone,
        role: roleToSave,
        shift: userData.shift || "Morning",
        isActive: true,
      },
    });
  }

  async updateStaff(storeId, staffId, userData) {
    const updateData = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.shift !== undefined) updateData.shift = userData.shift;
    if (userData.role) updateData.role = normalizeStaffRole(userData.role);
    if (userData.isActive !== undefined) {
      updateData.isActive = userData.isActive;
    } else if (userData.status !== undefined) {
      updateData.isActive = userData.status === "active";
    }

    return await prisma.storeStaff.update({
      where: { id: staffId },
      data: updateData,
    });
  }

  async deleteStaff(storeId, staffId) {
    return await prisma.storeStaff.delete({
      where: { id: staffId },
    });
  }

  async toggleStaffClock(storeId, staffId) {
    const latestShift = await prisma.shift.findFirst({
      where: { staffId },
      orderBy: { clockIn: "desc" },
    });

    if (latestShift && !latestShift.clockOut) {
      return await prisma.shift.update({
        where: { id: latestShift.id },
        data: { clockOut: new Date() },
      });
    } else {
      return await prisma.shift.create({
        data: {
          staffId,
          clockIn: new Date(),
        },
      });
    }
  }

  async updateStaffShift(storeId, staffId, shiftName) {
    return await prisma.storeStaff.update({
      where: { id: staffId },
      data: { shift: shiftName },
    });
  }
}

export const staffRepository = new StaffRepository();
