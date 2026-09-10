import jwt from "jsonwebtoken";
import { registerRepository } from "./register.repository.js";
import { otpService } from "../../utils/otp.service.js";
import { AppError } from "../../utils/AppError.js";

export class RegisterService {
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

    const existingUser = await registerRepository.findUserByPhone(cleanPhone);

    // Production check: When trying to LOGIN, user must exist and be active
    if (authMode === "LOGIN") {
      if (!existingUser) {
        throw new AppError(
          `No delivery partner account found with +91 ${cleanPhone}. Please switch to Sign Up to register.`,
          404
        );
      }
      if (
        existingUser.status === "banned" ||
        existingUser.status === "suspended" ||
        !existingUser.isActive
      ) {
        throw new AppError(
          "Your delivery partner account has been suspended or deactivated. Please contact support.",
          403
        );
      }
    }

    // Production check: When trying to REGISTER, verify if partner account already exists
    if (authMode === "REGISTER") {
      if (existingUser && existingUser.deliveryProfile) {
        throw new AppError(
          `This mobile number (+91 ${cleanPhone}) is already registered as a delivery partner. Please sign in to your account.`,
          409
        );
      }
      if (
        existingUser &&
        (existingUser.status === "banned" ||
          existingUser.status === "suspended" ||
          !existingUser.isActive)
      ) {
        throw new AppError(
          "This account has been suspended or deactivated. Please contact support.",
          403
        );
      }
    }

    const purpose = authMode === "REGISTER" ? "Partner Registration" : "Partner Login";
    await otpService.sendOtp({ phone: cleanPhone, purpose });

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      phone: cleanPhone,
      userExists: Boolean(existingUser),
      isRegistered: Boolean(existingUser?.deliveryProfile),
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

    // Verify OTP
    otpService.verifyOtp({ identifier: cleanPhone, inputOtp: cleanOtp });

    // Check if user already exists
    let user = await registerRepository.findUserByPhone(cleanPhone);
    let isNewUser = false;

    if (authMode === "LOGIN") {
      if (!user) {
        throw new AppError(
          `No delivery partner account found with +91 ${cleanPhone}. Please register first.`,
          404
        );
      }
      if (user.status === "banned" || user.status === "suspended" || !user.isActive) {
        throw new AppError(
          "Your delivery partner account has been suspended or deactivated. Please contact support.",
          403
        );
      }
    } else {
      if (!user) {
        user = await registerRepository.createPartnerUser({
          phone: cleanPhone,
          name: name || "Delivery Partner",
          vehicleType,
        });
        isNewUser = true;
      } else {
        await registerRepository.ensurePartnerProfile(user.id, vehicleType);
      }
    }

    // Fetch full profile from database
    const partnerProfile = await registerRepository.getFullPartnerProfile(user.id);

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
    const partnerProfile = await registerRepository.getFullPartnerProfile(userId);
    if (!partnerProfile) {
      throw new AppError("Delivery partner profile not found", 404);
    }

    const completedDeliveries = await registerRepository.countCompletedDeliveries(userId);

    const isKycCompleted =
      partnerProfile.kycStatus === "APPROVED" ||
      Boolean(partnerProfile.aadhaarNumber && partnerProfile.dlNumber && partnerProfile.rcNumber);

    // Dynamic subscription check (NONE by default, only active if bought)
    let subscriptionStatus = partnerProfile.subscriptionStatus || "NONE";
    let isSubscribed = false;
    if (subscriptionStatus === "ACTIVE" && partnerProfile.subscriptionExpiry) {
      if (new Date(partnerProfile.subscriptionExpiry) > new Date()) {
        isSubscribed = true;
      } else {
        subscriptionStatus = "EXPIRED";
      }
    }

    return {
      ...partnerProfile,
      walletBalance: partnerProfile.user?.walletBalance ?? 0,
      totalDeliveries: completedDeliveries > 0 ? completedDeliveries : (partnerProfile.totalDeliveries || 0),
      isKycCompleted,
      subscriptionPlan: isSubscribed ? partnerProfile.subscriptionPlan : null,
      subscriptionExpiry: isSubscribed ? partnerProfile.subscriptionExpiry : null,
      subscriptionStatus,
      hasSubscription: isSubscribed,
    };
  }

  /**
   * Buy / Activate rider subscription pass later from the app
   */
  async buySubscription(userId, { planKey = "MONTHLY_PRO" } = {}) {
    const PLANS = {
      WEEKLY_BOOST: {
        name: "Weekly Captain Boost",
        durationDays: 7,
        price: 49,
      },
      MONTHLY_PRO: {
        name: "Monthly Captain Pro",
        durationDays: 30,
        price: 149,
      },
      ANNUAL_ELITE: {
        name: "Annual Elite Pass",
        durationDays: 365,
        price: 999,
      },
    };

    const selected = PLANS[planKey] || PLANS.MONTHLY_PRO;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + selected.durationDays);

    await registerRepository.updatePartner(userId, {
      subscriptionPlan: selected.name,
      subscriptionExpiry: expiry,
      subscriptionStatus: "ACTIVE",
    });

    return await this.getProfile(userId);
  }

  /**
   * Cancel rider subscription
   */
  async cancelSubscription(userId) {
    await registerRepository.updatePartner(userId, {
      subscriptionStatus: "NONE",
      subscriptionPlan: null,
      subscriptionExpiry: null,
    });

    return await this.getProfile(userId);
  }

  /**
   * Update partner registration & KYC details
   */
  async updateProfile(userId, updateData) {
    const userFields = {};
    const partnerFields = {};

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
      await registerRepository.updateUser(userId, userFields);
    }

    if (Object.keys(partnerFields).length > 0) {
      await registerRepository.updatePartner(userId, partnerFields);
    }

    return await this.getProfile(userId);
  }
}

export const registerService = new RegisterService();
