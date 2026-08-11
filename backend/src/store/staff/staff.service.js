import { staffRepository } from "./staff.repository.js";
import { AppError } from "../../utils/AppError.js";
import { normalizeStaffRole } from "../../utils/roleUtils.js";
import { resolveStoreId } from "../shared.js";

export class StaffService {
  async getStaff(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await staffRepository.staff(storeId);
    return { success: true, data };
  }

  async createStaff(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);

    const name = payload.name?.trim();
    if (!name || name.length < 2) {
      throw new AppError("Full Name is required and must be at least 2 characters", 400);
    }

    const cleanPhone = String(payload.phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new AppError("Phone number is required and must be exactly 10 digits!", 400);
    }

    const email = payload.email?.trim();
    if (!email) {
      throw new AppError("Email address is compulsory!", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Enter a valid email address!", 400);
    }

    const cleanPin = String(payload.pin || "").replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 4) {
      throw new AppError("Secure PIN is required and must be exactly 4 digits!", 400);
    }

    const role = normalizeStaffRole(payload.role || payload.roleName);

    const normalizedPayload = {
      ...payload,
      name,
      phone: cleanPhone,
      email,
      pin: cleanPin,
      role,
      shift: payload.shift || "Morning",
    };

    const data = await staffRepository.createStaff(storeId, normalizedPayload);
    return { success: true, data, message: "Staff member created successfully" };
  }

  async updateStaff(user, storeIdParam, staffId, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const updatePayload = {};

    if (payload.name !== undefined) {
      const name = payload.name?.trim();
      if (!name || name.length < 2) {
        throw new AppError("Full Name must be at least 2 characters", 400);
      }
      updatePayload.name = name;
    }

    if (payload.email !== undefined) {
      const email = payload.email?.trim();
      if (!email) {
        throw new AppError("Email address is compulsory!", 400);
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Enter a valid email address!", 400);
      }
      updatePayload.email = email;
    }

    if (payload.phone !== undefined) {
      const cleanPhone = String(payload.phone || "").replace(/\D/g, "");
      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new AppError("Phone number must be exactly 10 digits", 400);
      }
      updatePayload.phone = cleanPhone;
    }

    if (payload.pin !== undefined && payload.pin !== null && String(payload.pin).trim() !== "") {
      const cleanPin = String(payload.pin).replace(/\D/g, "");
      if (cleanPin.length !== 4) {
        throw new AppError("Login PIN must be exactly 4 digits", 400);
      }
      updatePayload.pin = cleanPin;
    }

    if (payload.role || payload.roleName) {
      updatePayload.role = normalizeStaffRole(payload.role || payload.roleName);
    }

    if (payload.shift !== undefined) {
      updatePayload.shift = payload.shift;
    }

    if (payload.isActive !== undefined) {
      updatePayload.isActive = Boolean(payload.isActive);
    } else if (payload.status !== undefined) {
      updatePayload.isActive = payload.status === "active";
    }

    const data = await staffRepository.updateStaff(storeId, staffId, updatePayload);
    return { success: true, data, message: "Staff member updated successfully" };
  }

  async deleteStaff(user, storeIdParam, staffId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    await staffRepository.deleteStaff(storeId, staffId);
    return { success: true, message: "Staff member deleted successfully" };
  }

  async toggleStaffClock(user, storeIdParam, staffId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await staffRepository.toggleStaffClock(storeId, staffId);
    return { success: true, data, message: "Clock status updated" };
  }

  async updateStaffShift(user, storeIdParam, staffId, shiftName) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await staffRepository.updateStaffShift(storeId, staffId, shiftName);
    return { success: true, data, message: "Shift updated" };
  }
}

export const staffService = new StaffService();
