import { ownersRepository } from "./owners.repository.js";
import { AppError } from "../../utils/AppError.js";
import { cryptoService } from "../../utils/crypto.service.js";

export class OwnersService {
  async getAllOwners(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || "";
    const status = query.status || "";

    const result = await ownersRepository.findAllOwners(page, limit, search, status);
    
    // Decrypt bank details
    const decryptedData = result.data.map(user => {
      if (user.ownerProfile) {
        try { user.ownerProfile.bankAccount = cryptoService.decrypt(user.ownerProfile.bankAccount); } catch (e) {}
        try { user.ownerProfile.bankIfsc = cryptoService.decrypt(user.ownerProfile.bankIfsc); } catch (e) {}
      }
      return user;
    });

    return {
      success: true,
      data: decryptedData,
      meta: result.meta,
      message: "All owners retrieved successfully",
    };
  }

  async getOwnerDetails(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    if (owner.ownerProfile) {
      try { owner.ownerProfile.bankAccount = cryptoService.decrypt(owner.ownerProfile.bankAccount); } catch (e) {}
      try { owner.ownerProfile.bankIfsc = cryptoService.decrypt(owner.ownerProfile.bankIfsc); } catch (e) {}
    }

    return {
      success: true,
      data: owner,
      message: "Owner full details retrieved successfully",
    };
  }

  async disableOwner(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    const disabled = await ownersRepository.disableOwnerAndParkings(ownerId);
    return {
      success: true,
      data: { id: disabled.id, name: disabled.name, status: disabled.status },
      message: "Owner account suspended and all their parking lots paused",
    };
  }

  async enableOwner(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    const enabled = await ownersRepository.enableOwnerAndParkings(ownerId);
    return {
      success: true,
      data: { id: enabled.id, name: enabled.name, status: enabled.status },
      message: "Owner account re-activated and parking lots set to pending review",
    };
  }

  async getOwnerKycList(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || "";
    const status = query.status || "";

    const profiles = await ownersRepository.findOwnerProfiles(page, limit, search, status);

    const decryptedData = profiles.data.map(profile => {
      try { profile.bankAccount = cryptoService.decrypt(profile.bankAccount); } catch (e) {}
      try { profile.bankIfsc = cryptoService.decrypt(profile.bankIfsc); } catch (e) {}
      return profile;
    });

    return {
      success: true,
      data: decryptedData,
      meta: profiles.meta,
      message: "Owner KYC profiles retrieved successfully",
    };
  }

  async approveOwnerKyc(ownerId, status) {
    const profile = await ownersRepository.findOwnerProfileById(ownerId);
    if (!profile) throw new AppError("Owner profile not found", 404);

    if (status === "approved") {
        if (!profile.aadharNumber || !profile.aadharPic || !profile.bankAccount || !profile.bankIfsc) {
            throw new AppError("kyc details not found", 400);
        }
    } else if (status === "rejected") {
        await ownersRepository.clearKycDetails(ownerId);
    }

    const updated = await ownersRepository.updateOwnerKycStatus(ownerId, status);
    return {
      success: true,
      data: updated,
      message: `Owner business KYC profile marked as '${status}'`,
    };
  }

  async adminOnboardOwner({ name, phone, email, password, ownerType, gstNumber }) {
    const existingPhone = await ownersRepository.findUsers({ phone });
    if (existingPhone.length > 0) throw new AppError("Phone number already registered", 400);

    const existingEmail = await ownersRepository.findUsers({ email });
    if (existingEmail.length > 0) throw new AppError("Email already registered", 400);

    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await ownersRepository.directOnboardOwnerTransaction(
      { name, phone, email, passwordHash },
      ownerType,
      gstNumber
    );

    return {
      success: true,
      data: {
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        ownerType: result.profile.ownerType,
        verificationStatus: result.profile.verificationStatus,
      },
      message: "Owner business onboarded and pre-approved successfully by Super Admin",
    };
  }

  async updateOwner(ownerId, data) {
    const updated = await ownersRepository.updateOwner(ownerId, data);
    return {
      success: true,
      data: updated,
      message: "Owner profile updated successfully",
    };
  }

  async deleteOwner(ownerId) {
    await ownersRepository.deleteOwner(ownerId);
    return {
      success: true,
      message: "Owner account deleted successfully",
    };
  }
}


export const ownersService = new OwnersService();
