/**
 * Single Responsibility: In-memory OTP storage management and automatic expiration purge.
 */
export class OtpStore {
  constructor(cleanupIntervalMs = 5 * 60 * 1000) {
    // In-memory store: Key -> identifier (phone or email)
    // Value -> { otp, expiresAt, sentAt, attempts }
    this.store = new Map();

    this._cleanupInterval = setInterval(() => {
      this.purgeExpired();
    }, cleanupIntervalMs);

    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  set(identifier, data) {
    this.store.set(identifier, data);
  }

  get(identifier) {
    return this.store.get(identifier);
  }

  delete(identifier) {
    return this.store.delete(identifier);
  }

  has(identifier) {
    return this.store.has(identifier);
  }

  purgeExpired() {
    const now = Date.now();
    let purged = 0;
    for (const [key, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    if (purged > 0) {
      console.log(`[OTP CLEANUP] Purged ${purged} expired OTP entries`);
    }
  }
}

export const otpStore = new OtpStore();
