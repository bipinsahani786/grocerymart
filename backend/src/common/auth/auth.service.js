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
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role?.roleName || "user",
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

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

  async sendLoginOtp({ phone, email }) {
    const identifier = phone || email;
    const user = phone
      ? await authRepository.findUserByPhone(phone)
      : await authRepository.findUserByEmail(email);

    if (!user) throw new AppError("Account not found with this identifier", 404);
    if (user.status === "banned") throw new AppError("Your account is banned", 403);

    await otpService.sendOtp({ phone, email, purpose: "Login" });

    return {
      success: true,
      message: "Login OTP sent successfully",
      identifier,
    };
  }

  async verifyLoginOtp({ phone, email, otp }) {
    const identifier = phone || email;
    otpService.verifyOtp({ identifier, inputOtp: otp });

    const user = phone
      ? await authRepository.findUserByPhone(phone)
      : await authRepository.findUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);
    if (user.status !== "active") throw new AppError(`Account is ${user.status}`, 403);

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
          store: user.store || null,
        },
        ...tokens,
      },
      message: "Logged in successfully",
    };
  }

  async loginPassword({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);
    if (user.status !== "active") throw new AppError(`Account is ${user.status}`, 403);

    if (!user.passwordHash) throw new AppError("Password not set for this account. Use OTP login.", 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

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
          store: user.store || null,
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "fallback_secret");
      const user = await authRepository.findUserById(decoded.id);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.status !== "active") {
        throw new AppError(`Account is ${user.status}`, 403);
      }

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
    return user;
  }

  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!user.passwordHash) throw new AppError("Password not set for this account.", 400);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new AppError("Incorrect old password", 400);

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
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
}

export const authService = new AuthService();
