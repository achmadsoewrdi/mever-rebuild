import { Redis, RedisOptions } from "ioredis";
import { env } from "../config/env";

// 1. Konfigurasi Redis
export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  password: env.REDIS_PASS,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

/**
 * Factory function untuk membuat koneksi Redis baru.
 * Digunakan agar tiap worker (BLPOP) punya koneksi eksklusif.
 */
export const createRedisConnection = () => new Redis(redisConfig);

// 2. Inisialisasi koneksi global (untuk operasi umum non-blocking)
export const redisMain = createRedisConnection();

// 3. Setup pendengar (listener) untuk koneksi utama
redisMain.on("connect", () => console.log("[REDIS MAIN] Terhubung"));

/**
 * 4. Fungsi murni untuk memutus koneksi dengan aman
 */
export const disconnectRedis = async (): Promise<void> => {
  await redisMain.quit();
  console.log("[KONEKSI REDIS BERHASIL DITUTUP]");
};
