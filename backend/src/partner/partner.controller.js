import { partnerService } from "./partner.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { uploadToCloudflare } from "../utils/cloudflare.js";

export class PartnerController {
  /**
   * Request OTP for Delivery Partner (Login or Registration)
   */
  sendOtp = catchAsync(async (req, res) => {
    const result = await partnerService.sendOtp(req.body);
    res.status(200).json(result);
  });

  /**
   * Verify OTP and complete partner login / registration
   */
  verifyOtp = catchAsync(async (req, res) => {
    const result = await partnerService.verifyOtp(req.body);
    res.status(200).json(result);
  });

  /**
   * Get authenticated Delivery Partner profile
   */
  getProfile = catchAsync(async (req, res) => {
    const profile = await partnerService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Delivery partner profile fetched successfully",
      data: profile,
    });
  });

  /**
   * Update Delivery Partner Profile
   */
  updateProfile = catchAsync(async (req, res) => {
    const updated = await partnerService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Delivery partner profile updated successfully",
      data: updated,
    });
  });

  /**
   * Upload image (Avatar/Rider Photo or Vehicle Photo) to Cloudflare R2
   */
  uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }
    const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.status(200).json({
      success: true,
      message: "Avatar uploaded to Cloudflare R2 successfully",
      data: { url, public_url: url },
    });
  });
}

export const partnerController = new PartnerController();
