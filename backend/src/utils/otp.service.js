import nodemailer from "nodemailer";
import { smsGateway } from "./gateways/sms.gateway.js";
import { AppError } from "./AppError.js";

class OtpService {
  constructor() {
    // In-memory store: Key -> identifier (phone or email), Value -> { otp, expiresAt }
    this.store = new Map();

    // Nodemailer Transporter Initialization
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Generates, stores, and dispatches OTP.
   * Priority: If Email is provided, it sends via Email ONLY. 
   * If No Email is provided, it sends via SMS.
   */
  async sendOtp({ phone, email, purpose = "Verification" }) {
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes TTL

    // ─── EMAIL CHANNEL (PRIORITY 1) ───────────────────────────────
    if (email) {
      this.store.set(email, { otp, expiresAt });
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || `"ParkPal" <noreply@parkpal.com>`,
          to: email,
          subject: `${purpose} OTP - ParkPal`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #1a1a2e; text-align: center;">ParkPal ${purpose}</h2>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for ${purpose.toLowerCase()} is:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e94560;">
                ${otp}
              </div>
              <p>This OTP is valid for 15 minutes. Please do not share this code.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888; text-align: center;">© 2026 ParkPal Inc.</p>
            </div>
          `,
        };

        if (process.env.SMTP_USER && !process.env.SMTP_USER.includes("your-email")) {
          await this.transporter.sendMail(mailOptions);
          console.log(`[EMAIL SUCCESS] OTP ${otp} sent to ${email}`);
        } else {
          console.log(`[EMAIL SIMULATION] SMTP User missing. OTP for ${email} is: ${otp}`);
        }
        
        return { success: true, message: "OTP sent successfully via Email" };
      } catch (error) {
        console.error(`[OTP SERVICE] Email Dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via Email. Please try again later.", 500);
      }
    }

    // ─── SMS CHANNEL (PRIORITY 2 - Only if No Email) ──────────────
    if (phone) {
      this.store.set(phone, { otp, expiresAt });
      try {
        await smsGateway.sendSms(phone, otp);
        return { success: true, message: "OTP sent successfully via SMS" };
      } catch (error) {
        console.error(`[OTP SERVICE] SMS Dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via SMS. Please try again later.", 500);
      }
    }

    throw new AppError("No contact identifier (email/phone) provided for OTP", 400);
  }

  verifyOtp({ identifier, inputOtp }) {
    const record = this.store.get(identifier);
    if (!record) throw new AppError("OTP expired or not requested", 400);
    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      throw new AppError("OTP expired", 400);
    }
    if (record.otp !== inputOtp) throw new AppError("Invalid OTP", 400);

    this.store.delete(identifier);
    return true;
  }
}

export const otpService = new OtpService();
