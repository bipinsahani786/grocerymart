import { loginService } from "./login.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class LoginController {
  /**
   * Check if a partner user exists and can log in
   */
  checkUser = catchAsync(async (req, res) => {
    const result = await loginService.checkUser(req.body.phone);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Send 4-digit OTP for login (rejects non-existent users)
   */
  sendOtp = catchAsync(async (req, res) => {
    const result = await loginService.sendLoginOtp(req.body.phone);
    res.status(200).json(result);
  });

  /**
   * Verify login OTP and authenticate partner
   */
  verifyOtp = catchAsync(async (req, res) => {
    const result = await loginService.verifyLoginOtp(req.body);
    res.status(200).json(result);
  });
}

export const loginController = new LoginController();
