import { authService } from "./auth.service.js";
import { authRepository } from "./auth.repository.js";
import { catchAsync } from "../../utils/catchAsync.js";

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
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const updated = await authRepository.updateUser(req.user.id, updateData);
    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
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
}

export const authController = new AuthController();
