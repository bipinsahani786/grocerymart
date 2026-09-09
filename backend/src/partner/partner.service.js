import jwt from "jsonwebtoken";
import { partnerRepository } from "./partner.repository.js";
import { otpService } from "../utils/otp.service.js";
import { otpStore } from "../utils/otp/otp.store.js";
import { AppError } from "../utils/AppError.js";

export class PartnerService {
  /**
   * Helper to generate JWT tokens for Delivery Partner
   */
  generateTokens(user) {
    const payload = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role?.roleName || "delivery_partner",
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || "supersecretjwtkey12345",
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "60d" }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Send 4-digit OTP to the Delivery Partner mobile number
   */
  async sendOtp({ phone, authMode = "LOGIN" }) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new AppError("Please enter a valid 10-digit Indian mobile number", 400);
    }

    const existingUser = await partnerRepository.findUserByPhone(cleanPhone);
    if (authMode === "LOGIN" && !existingUser) {
      // In partner portal, if user doesn't exist yet, we still allow sending OTP
      // and will smoothly onboard them or flag during verification
    }

    const purpose = authMode === "REGISTER" ? "Partner Registration" : "Partner Login";
    await otpService.sendOtp({ phone: cleanPhone, purpose });

    const stored = otpStore.get(cleanPhone);
    const isBypass =
      process.env.BYPASS_REAL_SMS === "true" ||
      !process.env.NODE_ENV ||
      process.env.NODE_ENV !== "production";
    const devCode = stored?.otp || "1234";

    return {
      success: true,
      message: isBypass
        ? `OTP sent to +91 ${cleanPhone} (Test Code: ${devCode} or 1234)`
        : `OTP sent successfully to +91 ${cleanPhone}`,
      phone: cleanPhone,
      otp: isBypass ? devCode : undefined,
    };
  }

  /**
   * Verify OTP and complete sign-in or account creation in delivery_partners table
   */
  async verifyOtp({ phone, otp, authMode = "LOGIN", vehicleType = "EV_BIKE", name }) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const cleanOtp = String(otp).trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new AppError("Please enter a valid 10-digit mobile number", 400);
    }
    if (!cleanOtp || cleanOtp.length !== 4) {
      throw new AppError("Please enter a valid 4-digit OTP", 400);
    }

    // Verify OTP using OtpService
    otpService.verifyOtp({ identifier: cleanPhone, inputOtp: cleanOtp });

    // Check if user already exists
    let user = await partnerRepository.findUserByPhone(cleanPhone);
    let isNewUser = false;

    if (!user) {
      // Create new Delivery Partner User in dedicated tables
      user = await partnerRepository.createPartnerUser({
        phone: cleanPhone,
        name: name || "Delivery Partner",
        vehicleType,
      });
      isNewUser = true;
    } else {
      // Existing user: ensure delivery_partners table entry exists
      await partnerRepository.ensurePartnerProfile(user.id, vehicleType);
    }

    // Fetch full profile from database
    const partnerProfile = await partnerRepository.getFullPartnerProfile(user.id);

    // Generate JWT auth tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Compute KYC completion status
    const isKycCompleted =
      partnerProfile?.kycStatus === "APPROVED" ||
      Boolean(partnerProfile?.aadhaarNumber && partnerProfile?.dlNumber && partnerProfile?.rcNumber);

    return {
      success: true,
      message: isNewUser
        ? "Partner account created successfully"
        : "Partner logged in successfully",
      data: {
        token: accessToken,
        accessToken,
        refreshToken,
        isNewUser,
        isKycCompleted,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role?.roleName || "delivery_partner",
          status: user.status,
        },
        deliveryPartner: {
          id: partnerProfile?.id,
          userId: user.id,
          vehicleType: partnerProfile?.vehicleType || vehicleType,
          kycStatus: partnerProfile?.kycStatus || "PENDING",
          isKycCompleted,
          isOnline: partnerProfile?.isOnline || false,
          rating: partnerProfile?.rating || 5.0,
          totalDeliveries: partnerProfile?.totalDeliveries || 0,
          totalEarnings: partnerProfile?.totalEarnings || 0.0,
          address: partnerProfile?.address,
          city: partnerProfile?.city,
          pincode: partnerProfile?.pincode,
          rcNumber: partnerProfile?.rcNumber,
          dlNumber: partnerProfile?.dlNumber,
          allocatedHub: partnerProfile?.allocatedHub,
          stores: partnerProfile?.stores || [],
        },
      },
    };
  }

  /**
   * Get full partner profile
   */
  async getProfile(userId) {
    const partnerProfile = await partnerRepository.getFullPartnerProfile(userId);
    if (!partnerProfile) {
      throw new AppError("Delivery partner profile not found", 404);
    }

    const isKycCompleted =
      partnerProfile.kycStatus === "APPROVED" ||
      Boolean(partnerProfile.aadhaarNumber && partnerProfile.dlNumber && partnerProfile.rcNumber);

    return {
      ...partnerProfile,
      isKycCompleted,
    };
  }

  /**
   * Update partner details across users and delivery_partners tables
   */
  async updateProfile(userId, updateData) {
    const userFields = {};
    const partnerFields = {};

    // Segregate fields for User vs DeliveryPartner table
    if (updateData.name !== undefined) userFields.name = updateData.name.trim();
    if (updateData.email !== undefined) userFields.email = updateData.email?.trim() || null;
    if (updateData.avatar !== undefined) userFields.avatar = updateData.avatar;
    if (updateData.profilePhotoUri !== undefined) userFields.avatar = updateData.profilePhotoUri;

    const partnerAllowedKeys = [
      "address",
      "city",
      "pincode",
      "aadhaarNumber",
      "emergencyContact",
      "bloodGroup",
      "dlNumber",
      "dlExpiry",
      "rcNumber",
      "vehicleModel",
      "vehicleType",
      "vehiclePhotoUri",
      "bankHolderName",
      "bankAccountNumber",
      "bankIfsc",
      "panNumber",
      "allocatedHub",
      "isOnline",
      "currentLat",
      "currentLong",
    ];

    partnerAllowedKeys.forEach((key) => {
      if (updateData[key] !== undefined) {
        partnerFields[key] = updateData[key];
      }
    });

    if (
      partnerFields.aadhaarNumber &&
      partnerFields.dlNumber &&
      partnerFields.rcNumber
    ) {
      partnerFields.kycStatus = "APPROVED";
    }

    if (Object.keys(userFields).length > 0) {
      await partnerRepository.updateUser(userId, userFields);
    }

    if (Object.keys(partnerFields).length > 0) {
      await partnerRepository.updatePartner(userId, partnerFields);
    }

    return await this.getProfile(userId);
  }
}

export const partnerService = new PartnerService();
