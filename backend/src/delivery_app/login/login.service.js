import jwt from "jsonwebtoken";
import { loginRepository } from "./login.repository.js";
import { otpService } from "../../utils/otp.service.js";
import { AppError } from "../../utils/AppError.js";

export class LoginService {
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
   * Check if a partner user exists, is active, and can log in
   */
  async checkUser(phone) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new AppError("Please enter a valid 10-digit Indian mobile number", 400);
    }

    const user = await loginRepository.findUserWithPartnerByPhone(cleanPhone);

    // Case 1: No user exists with this phone number
    if (!user) {
      return {
        exists: false,
        canLogin: false,
        message: `No delivery partner account found with +91 ${cleanPhone}. Please register as a new partner.`,
        suggestion: "REGISTER",
      };
    }

    // Case 2: User exists but is banned or suspended
    if (user.status === "banned" || user.status === "suspended" || !user.isActive) {
      return {
        exists: true,
        canLogin: false,
        status: user.status,
        message: "Your delivery partner account has been suspended or deactivated. Please contact support at support@grocerymart.com.",
        suggestion: "CONTACT_SUPPORT",
      };
    }

    // Case 3: User exists but doesn't have a deliveryProfile (e.g. only customer)
    if (!user.deliveryProfile) {
      return {
        exists: true,
        canLogin: false,
        isPartner: false,
        message: "This mobile number is registered as a customer, but not as a delivery partner. Please register to become a delivery captain.",
        suggestion: "REGISTER",
      };
    }

    // Case 4: Valid delivery partner
    const isKycCompleted =
      user.deliveryProfile.kycStatus === "APPROVED" ||
      Boolean(
        user.deliveryProfile.aadhaarNumber &&
        user.deliveryProfile.dlNumber &&
        user.deliveryProfile.rcNumber
      );

    return {
      exists: true,
      canLogin: true,
      name: user.name || "Delivery Captain",
      kycStatus: user.deliveryProfile.kycStatus,
      isKycCompleted,
      message: "Delivery partner verified. Ready to sign in.",
    };
  }

  /**
   * Request OTP specifically for Login
   * Validates user existence & active status before dispatching OTP
   */
  async sendLoginOtp(phone) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new AppError("Please enter a valid 10-digit Indian mobile number", 400);
    }

    const check = await this.checkUser(cleanPhone);

    if (!check.exists) {
      throw new AppError(
        `No delivery partner account found with +91 ${cleanPhone}. Please click Sign Up to register.`,
        404
      );
    }

    if (!check.canLogin) {
      throw new AppError(check.message, 403);
    }

    // Dispatch OTP
    await otpService.sendOtp({ phone: cleanPhone, purpose: "Partner Login" });

    return {
      success: true,
      message: `4-digit login OTP sent successfully to +91 ${cleanPhone}`,
      phone: cleanPhone,
      partnerName: check.name,
      isKycCompleted: check.isKycCompleted,
    };
  }

  /**
   * Verify Login OTP and issue JWT session tokens
   */
  async verifyLoginOtp({ phone, otp }) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const cleanOtp = String(otp).trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new AppError("Please enter a valid 10-digit mobile number", 400);
    }
    if (!cleanOtp || cleanOtp.length !== 4) {
      throw new AppError("Please enter a valid 4-digit OTP", 400);
    }

    // 1. Verify OTP using OtpService
    otpService.verifyOtp({ identifier: cleanPhone, inputOtp: cleanOtp });

    // 2. Fetch authenticated partner
    const user = await loginRepository.findUserWithPartnerByPhone(cleanPhone);
    if (!user) {
      throw new AppError("Delivery partner account not found. Please register first.", 404);
    }

    if (user.status === "banned" || user.status === "suspended" || !user.isActive) {
      throw new AppError("Your account has been suspended or deactivated.", 403);
    }

    const partnerProfile = user.deliveryProfile;

    // 3. Compute KYC status
    const isKycCompleted =
      partnerProfile?.kycStatus === "APPROVED" ||
      Boolean(
        partnerProfile?.aadhaarNumber &&
        partnerProfile?.dlNumber &&
        partnerProfile?.rcNumber
      );

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      success: true,
      message: "Partner logged in successfully",
      data: {
        token: accessToken,
        accessToken,
        refreshToken,
        isNewUser: false,
        isKycCompleted,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name || "Delivery Partner",
          email: user.email,
          avatar: user.avatar,
          role: user.role?.roleName || "delivery_partner",
          status: user.status,
          createdAt: user.createdAt,
        },
        deliveryPartner: {
          id: partnerProfile?.id,
          userId: user.id,
          vehicleType: partnerProfile?.vehicleType || "EV_BIKE",
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
}

export const loginService = new LoginService();
