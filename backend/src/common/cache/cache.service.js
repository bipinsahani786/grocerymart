import { createClient } from "redis";

class CacheService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => console.error("Redis Client Error:", err));
    this.client.on("connect", () => console.log("Connected to Redis server successfully."));

    // Connect asynchronously
    this.client.connect().catch((err) => {
      console.error("Failed to connect to Redis on startup:", err);
    });
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`Redis Get Error for key ${key}:`, err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 60) {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
      return true;
    } catch (err) {
      console.error(`Redis Set Error for key ${key}:`, err);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      console.error(`Redis Del Error for key ${key}:`, err);
      return false;
    }
  }

  // Wildcard cache invalidation (pattern e.g. "categories:storeId:*")
  async delPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`[Redis Cache] Invalidated ${keys.length} keys matching: ${pattern}`);
      }
      return true;
    } catch (err) {
      console.error(`Redis delPattern Error for pattern ${pattern}:`, err);
      return false;
    }
  }
}

export const cacheService = new CacheService();
