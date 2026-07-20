import { authService } from "./auth.service.js";
import { authRepository } from "./auth.repository.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import path from "path";
import fs from "fs";

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
    const updated = await authRepository.updateUser(req.user.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
      },
      message: "Profile updated successfully"
    });
  });

  uploadAvatar = catchAsync(async (req, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    
    // Convert to relative URL path that express.static will serve
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await authRepository.findUserById(req.user.id);
    if (user.avatar) {
      // Remove old avatar if it's local
      if (user.avatar.startsWith('/uploads')) {
        const oldPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await authRepository.updateUser(req.user.id, { avatar: avatarUrl });
    res.json({ 
      success: true, 
      data: { avatar: updated.avatar },
      message: "Avatar uploaded successfully"
    });
  });

  removeAvatar = catchAsync(async (req, res) => {
    const user = await authRepository.findUserById(req.user.id);
    if (user.avatar) {
      if (user.avatar.startsWith('/uploads')) {
        const oldPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    const updated = await authRepository.updateUser(req.user.id, { avatar: null });
    res.json({ success: true, data: { avatar: null }, message: "Avatar removed" });
  });
}

export const authController = new AuthController();
