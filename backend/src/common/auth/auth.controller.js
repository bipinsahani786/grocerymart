import { authService } from "./auth.service.js";
import { authRepository } from "./auth.repository.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";

export class AuthController {
  register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  });

  verifyRegisterOtp = catchAsync(async (req, res) => {
    const result = await authService.verifyRegisterOtp(req.body);
    res.json(result);
  });

  sendLoginOtp = catchAsync(async (req, res) => {
    const result = await authService.sendLoginOtp(req.body);
    res.json(result);
  });

  verifyLoginOtp = catchAsync(async (req, res) => {
    const result = await authService.verifyLoginOtp(req.body);
    res.json(result);
  });

  loginPassword = catchAsync(async (req, res) => {
    const result = await authService.loginPassword(req.body);
    res.json(result);
  });

  refreshToken = catchAsync(async (req, res) => {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.json(result);
  });

  logout = catchAsync(async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });

  getProfile = catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: await authService.getUserProfile(req.user.id),
      message: "Profile retrieved successfully",
    });
  });

  changePassword = catchAsync(async (req, res) => {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  });

  seedAdmin = catchAsync(async (req, res) => {
    const result = await authService.seedAdmin();
    res.json(result);
  });

  updateProfile = catchAsync(async (req, res) => {
    const data = req.body;
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) {
      if (data.email === null || String(data.email).trim() === "") {
        updateData.email = null;
      } else {
        const cleanEmail = String(data.email).toLowerCase().trim();
        const existing = await authRepository.findUserByEmail(cleanEmail);
        if (existing && String(existing.id) !== String(req.user.id)) {
          throw new AppError("This email address is already in use by another user account", 400);
        }
        updateData.email = cleanEmail;
      }
    }
    if (data.phone !== undefined && data.phone !== null && data.phone !== "") {
      const cleanPhone = String(data.phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new AppError("Enter Valid phone number!", 400);
      }
      const existing = await authRepository.findUserByPhone(cleanPhone);
      if (existing && String(existing.id) !== String(req.user.id)) {
        throw new AppError("This phone number is already registered to another user account", 400);
      }
      updateData.phone = cleanPhone;
    } else if (data.phone === null || data.phone === "") {
      updateData.phone = null;
    }
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.dob !== undefined) {
      updateData.dob = data.dob ? String(data.dob).trim() : null;
    }

    const updated = await authRepository.updateUser(req.user.id, updateData);
    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
        dob: updated.dob,
        status: updated.status,
        role: updated.role?.roleName || "user",
        store: updated.store || null,
      },
      message: "Profile updated successfully",
    });
  });

  removeAvatar = catchAsync(async (req, res) => {
    const updated = await authRepository.updateUser(req.user.id, { avatar: null });
    res.json({ success: true, data: { avatar: null }, message: "Avatar removed" });
  });

  sendOtpDirect = catchAsync(async (req, res) => {
    const result = await authService.sendOtpDirect(req.body);
    res.json(result);
  });

  verifyOtpDirect = catchAsync(async (req, res) => {
    const result = await authService.verifyOtpDirect(req.body);
    res.json(result);
  });

  registerCustomerDirect = catchAsync(async (req, res) => {
    const result = await authService.registerCustomerDirect(req.body);
    res.json(result);
  });
}

export const authController = new AuthController();
