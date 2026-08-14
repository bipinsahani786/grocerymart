import { AppError } from "../AppError.js";

/**
 * Single Responsibility: Rate limiting and resend cooldown enforcement for OTP requests.
 */
export class OtpRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 5, cooldownMs = 60 * 1000) {
    this.rateMap = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.cooldownMs = cooldownMs;

    this._cleanupInterval = setInterval(() => {
      this.purgeExpiredWindows();
    }, windowMs);

    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  purgeExpiredWindows() {
    const now = Date.now();
    for (const [key, rate] of this.rateMap.entries()) {
      if (now - rate.windowStart > this.windowMs) {
        this.rateMap.delete(key);
      }
    }
  }

  /**
   * Enforces max requests per identifier per window
   */
  checkRateLimit(identifier) {
    const now = Date.now();
    const rate = this.rateMap.get(identifier);

    if (!rate || now - rate.windowStart > this.windowMs) {
      this.rateMap.set(identifier, { count: 1, windowStart: now });
      return;
    }

    if (rate.count >= this.maxRequests) {
      const waitMinutes = Math.ceil((this.windowMs - (now - rate.windowStart)) / 60000);
      throw new AppError(
        `Too many OTP requests. Please wait ${waitMinutes} minute(s) before requesting again.`,
        429
      );
    }

    rate.count++;
  }

  /**
   * Enforces cooldown between successive OTP sends to same identifier
   */
  checkResendCooldown(lastSentRecord) {
    if (lastSentRecord && lastSentRecord.sentAt) {
      const timeSinceSent = Date.now() - lastSentRecord.sentAt;
      if (timeSinceSent < this.cooldownMs) {
        const waitSec = Math.ceil((this.cooldownMs - timeSinceSent) / 1000);
        throw new AppError(
          `OTP already sent. Please wait ${waitSec} second(s) before requesting a new one.`,
          429
        );
      }
    }
  }
}

export const otpRateLimiter = new OtpRateLimiter();
