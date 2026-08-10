import nodemailer from "nodemailer";
import { smsGateway } from "./gateways/sms.gateway.js";
import { AppError } from "./AppError.js";

class OtpService {
  constructor() {
    // In-memory store: Key -> identifier (phone or email)
    // Value -> { otp, expiresAt, sentAt, attempts }
    this.store = new Map();

    // Rate limiter: Key -> identifier, Value -> { count, windowStart }
    this.rateMap = new Map();

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

    // ✅ Auto-cleanup: Run every 5 minutes to purge expired OTPs from memory
    this._cleanupInterval = setInterval(() => {
      this._purgeExpired();
    }, 5 * 60 * 1000);

    // Allow Node.js to exit even if this interval is running
    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  /** Remove all expired OTPs from the in-memory store */
  _purgeExpired() {
    const now = Date.now();
    let purged = 0;
    for (const [key, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    // Also purge old rate-limit windows (older than 15 min)
    for (const [key, rate] of this.rateMap.entries()) {
      if (now - rate.windowStart > 15 * 60 * 1000) {
        this.rateMap.delete(key);
      }
    }
    if (purged > 0) {
      console.log(`[OTP CLEANUP] Purged ${purged} expired OTP entries`);
    }
  }

  /** Rate limit: Max 5 OTP requests per identifier per 15-minute window */
  _checkRateLimit(identifier) {
    const now = Date.now();
    const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    const MAX_REQUESTS = 5;

    const rate = this.rateMap.get(identifier);

    if (!rate || now - rate.windowStart > WINDOW_MS) {
      // Fresh window
      this.rateMap.set(identifier, { count: 1, windowStart: now });
      return;
    }

    if (rate.count >= MAX_REQUESTS) {
      const waitMinutes = Math.ceil((WINDOW_MS - (now - rate.windowStart)) / 60000);
      throw new AppError(
        `Too many OTP requests. Please wait ${waitMinutes} minute(s) before requesting again.`,
        429
      );
    }

    rate.count++;
  }

  /** Enforce 60-second cooldown between successive OTP sends to same identifier */
  _checkResendCooldown(identifier) {
    const record = this.store.get(identifier);
    if (record) {
      const cooldownMs = 60 * 1000; // 60 seconds
      const timeSinceSent = Date.now() - record.sentAt;
      if (timeSinceSent < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - timeSinceSent) / 1000);
        throw new AppError(
          `OTP already sent. Please wait ${waitSec} second(s) before requesting a new one.`,
          429
        );
      }
    }
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
    const identifier = email || phone;
    if (!identifier) {
      throw new AppError("No contact identifier (email/phone) provided for OTP", 400);
    }

    // ✅ Rate limiting check
    this._checkRateLimit(identifier);

    // ✅ Resend cooldown check
    this._checkResendCooldown(identifier);

    const otp = this.generateOtp();
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes TTL

    // ─── EMAIL CHANNEL (PRIORITY 1) ───────────────────────────────
    if (email) {
      this.store.set(email, { otp, expiresAt, sentAt: now, attempts: 0 });
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || `"Grocery Mart" <noreply@grocerymart.com>`,
          to: email,
          subject: `${purpose} OTP - Grocery Mart`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #1a1a2e; text-align: center;">Grocery Mart ${purpose}</h2>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for ${purpose.toLowerCase()} is:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e94560;">
                ${otp}
              </div>
              <p>This OTP is valid for 15 minutes. Please do not share this code with anyone.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Grocery Mart Inc.</p>
            </div>
          `,
        };

        if (process.env.SMTP_USER && !process.env.SMTP_USER.includes("your-email")) {
          await this.transporter.sendMail(mailOptions);
          console.log(`[OTP EMAIL] ✅ Sent to ${email} for ${purpose}`);
        } else {
          // Development fallback — log OTP to console
          console.log(`[OTP DEV] 📧 SMTP not configured. OTP for ${email}: ${otp}`);
        }

        return { success: true, message: "OTP sent successfully via Email" };
      } catch (error) {
        // Roll back store entry on send failure
        this.store.delete(email);
        console.error(`[OTP EMAIL] ❌ Email dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via Email. Please try again later.", 500);
      }
    }

    // ─── SMS CHANNEL (PRIORITY 2 - Only if No Email) ──────────────
    if (phone) {
      this.store.set(phone, { otp, expiresAt, sentAt: now, attempts: 0 });
      try {
        await smsGateway.sendSms(phone, otp);
        console.log(`[OTP SMS] ✅ Sent to ${phone} for ${purpose}`);
        return { success: true, message: "OTP sent successfully via SMS" };
      } catch (error) {
        // Roll back store entry on send failure
        this.store.delete(phone);
        console.error(`[OTP SMS] ❌ SMS dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via SMS. Please try again later.", 500);
      }
    }

    throw new AppError("No valid contact identifier (email/phone) provided", 400);
  }

  verifyOtp({ identifier, inputOtp }) {
    // ✅ Check expiry first (purge expired on read)
    const record = this.store.get(identifier);
    if (!record) {
      throw new AppError("OTP expired or was never requested. Please request a new OTP.", 400);
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      throw new AppError("OTP has expired. Please request a new OTP.", 400);
    }

    // ✅ Track failed attempts per OTP (max 5 before invalidation)
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > 5) {
      this.store.delete(identifier);
      throw new AppError("Too many incorrect OTP attempts. Please request a new OTP.", 400);
    }

    if (String(record.otp) !== String(inputOtp)) {
      const remaining = 5 - record.attempts;
      throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400);
    }

    // OTP correct — delete immediately (single use)
    this.store.delete(identifier);
    console.log(`[OTP] ✅ Verified for identifier: ${identifier}`);
    return true;
  }
}

export const otpService = new OtpService();
