import { Redis, RedisOptions } from "ioredis";
import { env } from "../config/env";

// 1. Konfigurasi Redis
const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  password: env.REDIS_PASS,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

// 2. Inisialisasi koneksi langsung secara bebas
export const redisMain = new Redis(redisConfig);
export const redisQueue = new Redis(redisConfig);

// 3. Setup pendengar (listener) langsung diikat ke variabelnya
redisMain.on("connect", () => {
  console.log(
    "[REDIS MAIN BERHASIL] Berhasil terhubung ke redis untuk operasi umum",
  );
});
redisMain.on("error", (err) => {
  console.error("[REDIS MAIN ERROR] Gagal terhubung:", err.message);
});

redisQueue.on("connect", () => {
  console.log(
    "[REDIS QUEUE BERHASIL] Berhasil terhubung ke redis untuk operasi antrian",
  );
});
redisQueue.on("error", (err) => {
  console.error("[REDIS QUEUE ERROR] Gagal terhubung:", err.message);
});

/**
 * 4. Fungsi murni untuk memutus koneksi dengan aman
 */
export const disconnectRedis = async (): Promise<void> => {
  await redisMain.quit();
  await redisQueue.quit();
  console.log("[KONEKSI REDIS BERHASIL DITUTUP]");
};
