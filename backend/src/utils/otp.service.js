import { otpStore } from "./otp/otp.store.js";
import { otpRateLimiter } from "./otp/otp.limiter.js";
import { otpNotifier } from "./otp/otp.notifier.js";
import { AppError } from "./AppError.js";

/**
 * Single Responsibility: High-level orchestration of OTP generation and verification workflows.
 */
class OtpService {
  constructor(store = otpStore, limiter = otpRateLimiter, notifier = otpNotifier) {
    this.store = store;
    this.limiter = limiter;
    this.notifier = notifier;
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

    // Rate limiting check
    this.limiter.checkRateLimit(identifier);

    // Resend cooldown check
    const existingRecord = this.store.get(identifier);
    this.limiter.checkResendCooldown(existingRecord);

    const otp = this.generateOtp();
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes TTL

    // ─── EMAIL CHANNEL (PRIORITY 1) ───────────────────────────────
    if (email) {
      this.store.set(email, { otp, expiresAt, sentAt: now, attempts: 0 });
      try {
        return await this.notifier.sendEmail(email, otp, purpose);
      } catch (error) {
        this.store.delete(email);
        console.error(`[OTP EMAIL] ❌ Email dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via Email. Please try again later.", 500);
      }
    }

    // ─── SMS CHANNEL (PRIORITY 2 - Only if No Email) ──────────────
    if (phone) {
      this.store.set(phone, { otp, expiresAt, sentAt: now, attempts: 0 });
      try {
        return await this.notifier.sendSms(phone, otp, purpose);
      } catch (error) {
        this.store.delete(phone);
        console.error(`[OTP SMS] ❌ SMS dispatch failed:`, error.message);
        throw new AppError("Failed to send OTP via SMS. Please try again later.", 500);
      }
    }

    throw new AppError("No valid contact identifier (email/phone) provided", 400);
  }

  verifyOtp({ identifier, inputOtp }) {
    const record = this.store.get(identifier);
    if (!record) {
      throw new AppError("OTP expired or was never requested. Please request a new OTP.", 400);
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      throw new AppError("OTP has expired. Please request a new OTP.", 400);
    }

    // Track failed attempts per OTP (max 5 before invalidation)
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
