import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { otpService } from "../../utils/otp.service.js";
import { AppError } from "../../utils/AppError.js";

export class AuthService {
  constructor() {
    this.pendingRegistrations = new Map();
  }

  generateTokens(user) {
    // Minimal payload — role is re-validated from DB on every request via middleware
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role?.roleName || user.role?.role?.toLowerCase() || "user",
    };

    // ✅ FIX: Access token uses JWT_SECRET, Refresh token uses JWT_REFRESH_SECRET
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "fallback_access_secret", {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const refreshToken = jwt.sign(
      { id: user.id }, // Refresh token only needs ID — no stale role data
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
    );

    return { accessToken, refreshToken };
  }

  getRegistrationIdentifier({ phone, email }) {
    return email || phone;
  }

  cachePendingRegistration(identifier, registrationData) {
    this.pendingRegistrations.set(identifier, {
      data: registrationData,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  }

  getPendingRegistration(identifier) {
    const pending = this.pendingRegistrations.get(identifier);
    if (!pending) throw new AppError("Registration session expired. Please register again.", 400);

    if (Date.now() > pending.expiresAt) {
      this.pendingRegistrations.delete(identifier);
      throw new AppError("Registration session expired. Please register again.", 400);
    }

    return pending.data;
  }

  async ensureIdentifierAvailable(existingUser, fieldLabel) {
    if (!existingUser) return;

    const usageCounts = Object.values(existingUser._count || {});
    const hasActivity = usageCounts.some((count) => count > 0);
    const hasZeroWallet = Number(existingUser.walletBalance || 0) === 0;

    if (existingUser.status === "suspended" && !hasActivity && hasZeroWallet) {
      await authRepository.deleteUser(existingUser.id);
      return;
    }

    throw new AppError(`${fieldLabel} already registered`, 400);
  }

  async register({ name, email, password, phone, userType, adminRole }) {
    if (phone) {
      const existingPhone = await authRepository.findUserByPhoneWithUsage(phone);
      await this.ensureIdentifierAvailable(existingPhone, "Phone number");
    }

    if (email) {
      const existingEmail = await authRepository.findUserByEmailWithUsage(email);
      await this.ensureIdentifierAvailable(existingEmail, "Email");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const identifier = this.getRegistrationIdentifier({ phone, email });

    this.cachePendingRegistration(identifier, {
      name,
      email,
      phone,
      passwordHash,
      status: "active",
      roleName: "store_manager", // By default, signups are for store managers
    });

    await otpService.sendOtp({ phone, email, purpose: "Registration" });

    return {
      success: true,
      message: "OTP sent successfully to registered mobile number and/or email",
      phone,
      email,
    };
  }

  async verifyRegisterOtp({ phone, email, otp }) {
    const identifier = this.getRegistrationIdentifier({ phone, email });
    otpService.verifyOtp({ identifier, inputOtp: otp });

    const pendingRegistration = this.getPendingRegistration(identifier);

    if (pendingRegistration.phone) {
      const existingPhone = await authRepository.findUserByPhoneWithUsage(pendingRegistration.phone);
      await this.ensureIdentifierAvailable(existingPhone, "Phone number");
    }

    if (pendingRegistration.email) {
      const existingEmail = await authRepository.findUserByEmailWithUsage(pendingRegistration.email);
      await this.ensureIdentifierAvailable(existingEmail, "Email");
    }

    const createdUser = await authRepository.createUser(
      {
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        phone: pendingRegistration.phone,
        passwordHash: pendingRegistration.passwordHash,
        status: pendingRegistration.status,
      },
      pendingRegistration.roleName
    );

    const activeUser = await authRepository.findUserById(createdUser.id);
    this.pendingRegistrations.delete(identifier);
    const tokens = this.generateTokens(activeUser);

    return {
      success: true,
      data: {
        user: {
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          phone: activeUser.phone,
          avatar: activeUser.avatar,
          role: activeUser.role?.roleName || "user",
          store: activeUser.store || null,
        },
        ...tokens,
      },
      message: "Account verified and registered successfully. Business KYC verification pending super admin approval.",
    };
  }

  verifyUserAndStoreActiveStatus(user) {
    if (!user) throw new AppError("Account not found", 404);

    if ((user.status && user.status !== "active") || user.isActive === false) {
      throw new AppError(`Your account is currently ${user.status || 'inactive'}. Access denied.`, 403);
    }

    const isSuperAdmin = 
      user.role?.roleName === "super_admin" || 
      user.role?.roleName === "admin" || 
      user.role?.role === "SUPER_ADMIN" || 
      user.role?.role === "ADMIN";

    if (!isSuperAdmin) {
      const assignedStore = user.managedStore || user.store;
      if (assignedStore && assignedStore.isActive === false) {
        throw new AppError(`Your franchise store "${assignedStore.name}" is currently inactive. Access denied.`, 403);
      }
    }
  }

  async sendLoginOtp({ phone, email }) {
    const cleanPhone = phone ? phone.trim() : null;
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const identifier = cleanPhone || cleanEmail;

    const user = cleanPhone
      ? await authRepository.findUserByPhone(cleanPhone)
      : await authRepository.findUserByEmail(cleanEmail);

    if (!user) throw new AppError("Account not found with this identifier", 404);
    this.verifyUserAndStoreActiveStatus(user);

    await otpService.sendOtp({ phone: cleanPhone, email: cleanEmail, purpose: "Login" });

    return {
      success: true,
      message: "Login OTP sent successfully",
      identifier,
    };
  }

  async verifyLoginOtp({ phone, email, otp }) {
    const cleanPhone = phone ? phone.trim() : null;
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const identifier = cleanPhone || cleanEmail;

    otpService.verifyOtp({ identifier, inputOtp: otp });

    const user = cleanPhone
      ? await authRepository.findUserByPhone(cleanPhone)
      : await authRepository.findUserByEmail(cleanEmail);

    if (!user) throw new AppError("User not found", 404);
    this.verifyUserAndStoreActiveStatus(user);

    const tokens = this.generateTokens(user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role?.roleName || "user",
          store: user.managedStore || user.store || null,
        },
        ...tokens,
      },
      message: "Logged in successfully",
    };
  }

  async loginPassword({ email, password }) {
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const user = await authRepository.findUserByEmail(cleanEmail);
    if (!user) throw new AppError("Invalid email or password", 401);
    if (!user.passwordHash) throw new AppError("Password not set for this account. Use OTP login.", 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    this.verifyUserAndStoreActiveStatus(user);

    const tokens = this.generateTokens(user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role?.roleName || "user",
          store: user.managedStore || user.store || null,
        },
        ...tokens,
      },
      message: "Logged in successfully",
    };
  }
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token not provided", 401);
    }

    try {
      // ✅ FIX: Refresh token verified with its own separate secret
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret");
      const user = await authRepository.findUserById(decoded.id);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      this.verifyUserAndStoreActiveStatus(user);

      // Issue fresh token pair
      const tokens = this.generateTokens(user);

      return {
        success: true,
        data: tokens,
        message: "Token refreshed successfully",
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  async getUserProfile(id) {
    const user = await authRepository.getUserProfile(id);
    if (!user) return null;
    this.verifyUserAndStoreActiveStatus(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      dob: user.dob,
      status: user.status,
      role: user.role?.roleName || "user",
      store: user.managedStore || user.store || null,
      loyaltyPoints: user.loyaltyPoints || 0,
      walletBalance: user.walletBalance || 0,
      totalOrders: user.totalOrders || 0,
    };
  }

  async changePassword(userId, payload) {
    const oldPass = payload.current_password || payload.oldPassword;
    const newPass = payload.new_password || payload.newPassword;

    if (!oldPass) throw new AppError("Current password is required", 400);
    if (!newPass || newPass.length < 6) throw new AppError("New password must be at least 6 characters", 400);

    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!user.passwordHash) throw new AppError("Password is not set for this account.", 400);

    const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isMatch) throw new AppError("Current password entered is incorrect.", 400);

    const newPasswordHash = await bcrypt.hash(newPass, 10);
    await authRepository.updatePassword(userId, newPasswordHash);

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  async seedAdmin() {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const existing = await authRepository.findUserByEmail("admin@grocerymart.com");
    if (existing) {
      await authRepository.deleteUser(existing.id);
    }

    const created = await authRepository.createUser({
      email: "admin@grocerymart.com",
      phone: "1234567890",
      passwordHash,
      name: "Super Admin",
      status: "active",
    }, "super_admin");

    return {
      success: true,
      message: "Super admin seeded successfully",
      data: created,
    };
  }

  async sendOtpDirect({ phone }) {
    if (!phone || String(phone).trim().length !== 10) {
      throw new AppError("A valid 10-digit phone number is required", 400);
    }
    const cleanPhone = String(phone).trim();
    
    // Send OTP via OTP service
    await otpService.sendOtp({ phone: cleanPhone, purpose: "Verification" });

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOtpDirect({ phone, otp }) {
    if (!phone || !otp) {
      throw new AppError("Phone and OTP code are required", 400);
    }
    const cleanPhone = String(phone).trim();

    // Verify OTP code
    otpService.verifyOtp({ identifier: cleanPhone, inputOtp: otp });

    // Check if user already exists
    const user = await authRepository.findUserByPhone(cleanPhone);

    // Profile is complete if user exists, user has a name, and name is not empty or "POS Customer"
    const isProfileComplete = user && user.name && 
      user.name.toLowerCase() !== "pos customer" && 
      user.name.toLowerCase() !== "pos user";

    if (isProfileComplete) {
      this.verifyUserAndStoreActiveStatus(user);
      const tokens = this.generateTokens(user);
      return {
        success: true,
        isNewUser: false,
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            email: user.email,
            dob: user.dob,
            role: user.role?.roleName || "user",
          },
          ...tokens,
        },
        message: "Logged in successfully",
      };
    }

    return {
      success: true,
      isNewUser: true,
      message: "OTP verified. Complete profile creation.",
    };
  }

  async registerCustomerDirect({ phone, name, dob, referralCode }) {
    if (!phone || !name || !dob) {
      throw new AppError("Phone, Name, and DOB are required", 400);
    }
    const cleanPhone = String(phone).trim();

    // Verify user doesn't already exist or merge if POS customer
    const existing = await authRepository.findUserByPhone(cleanPhone);
    let activeUser;
    
    if (existing) {
      // Update the existing profile-incomplete record
      activeUser = await authRepository.updateUser(existing.id, {
        name: name.trim(),
        dob: dob.trim(),
        referralCode: referralCode ? referralCode.trim() : null,
        status: "active",
        role: {
          upsert: {
            create: { roleName: "user" },
            update: { roleName: "user" }
          }
        }
      });
    } else {
      // Create user with user role
      const createdUser = await authRepository.createUser(
        {
          phone: cleanPhone,
          name: name.trim(),
          dob: dob.trim(),
          referralCode: referralCode ? referralCode.trim() : null,
          status: "active",
        },
        "user"
      );
      activeUser = await authRepository.findUserById(createdUser.id);
    }

    const tokens = this.generateTokens(activeUser);

    return {
      success: true,
      data: {
        user: {
          id: activeUser.id,
          name: activeUser.name,
          phone: activeUser.phone,
          avatar: activeUser.avatar,
          email: activeUser.email,
          dob: activeUser.dob,
          role: "CUSTOMER",
        },
        ...tokens,
      },
      message: "Profile registered successfully",
    };
  }
}

export const authService = new AuthService();
