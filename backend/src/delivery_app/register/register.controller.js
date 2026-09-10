import { registerService } from "./register.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { uploadToCloudflare } from "../../utils/cloudflare.js";

export class RegisterController {
  /**
   * Request OTP for Delivery Partner Registration or Login
   */
  sendOtp = catchAsync(async (req, res) => {
    const result = await registerService.sendOtp(req.body);
    res.status(200).json(result);
  });

  /**
   * Verify OTP and complete registration / authentication
   */
  verifyOtp = catchAsync(async (req, res) => {
    const result = await registerService.verifyOtp(req.body);
    res.status(200).json(result);
  });

  /**
   * Get partner profile
   */
  getProfile = catchAsync(async (req, res) => {
    const profile = await registerService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Delivery partner profile fetched successfully",
      data: profile,
    });
  });

  /**
   * Complete / update partner registration KYC
   */
  updateProfile = catchAsync(async (req, res) => {
    const updated = await registerService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Delivery partner profile updated successfully",
      data: updated,
    });
  });

  /**
   * Update partner duty status (online / offline) and live coordinates in backend
   */
  updateDuty = catchAsync(async (req, res) => {
    const isOnline = Boolean(req.body.isOnline);
    const updated = await registerService.updateProfile(req.user.id, {
      isOnline,
      currentLat: req.body.currentLat !== undefined ? Number(req.body.currentLat) : undefined,
      currentLong: req.body.currentLong !== undefined ? Number(req.body.currentLong) : undefined,
    });
    res.status(200).json({
      success: true,
      message: `Partner duty status updated to ${isOnline ? "ONLINE" : "OFFLINE"}`,
      data: {
        isOnline: Boolean(updated.isOnline),
        currentLat: updated.currentLat,
        currentLong: updated.currentLong,
        deliveryPartner: updated,
      },
    });
  });

  /**
   * Upload image (Avatar / Document / RC / DL photo) to Cloudflare R2
   */
  uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }
    const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.status(200).json({
      success: true,
      message: "Document uploaded to Cloudflare R2 successfully",
      data: { url, public_url: url },
    });
  });

  /**
   * Buy / Activate rider subscription pass later from the app
   */
  buySubscription = catchAsync(async (req, res) => {
    const updated = await registerService.buySubscription(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: `Rider subscription (${updated.subscriptionPlan}) activated successfully!`,
      data: updated,
    });
  });

  /**
   * Cancel rider subscription
   */
  cancelSubscription = catchAsync(async (req, res) => {
    const updated = await registerService.cancelSubscription(req.user.id);
    res.status(200).json({
      success: true,
      message: "Rider subscription cancelled successfully",
      data: updated,
    });
  });
}

export const registerController = new RegisterController();
