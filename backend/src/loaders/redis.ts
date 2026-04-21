import Redis from "ioredis";
import { env } from "../config/env";

export const redisCache = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASS,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redisCache.on("connect", () => {
  console.log("✅ Redis Cache terhubung");
});
redisCache.on("error", (err) => {
  console.error("❌ Redis Cache error:", err.message);
});
