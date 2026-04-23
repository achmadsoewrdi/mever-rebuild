import { Redis, RedisOptions } from "ioredis";
import { env } from "../config/env";

class RedisLoader {
  // properti (Variabel) milik class
  public main: Redis;
  public queue: Redis;

  // construcor
  constructor() {
    const redisConfig: RedisOptions = {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10),
      password: env.REDIS_PASS,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

    this.main = new Redis(redisConfig);
    this.queue = new Redis(redisConfig);
    this.setupListeners();
  }

  private setupListeners() {
    this.main.on("connect", () => {
      console.log(
        "[REDIS MAIN BERHASIL] Berhasil terhubung ke redis untuk operasi umum",
      );
    });
    this.main.on("error", (err) => {
      console.log("[REDIS MAIN ERROR] Gagal terhubung", err.message);
    });

    this.queue.on("connect", () => {
      console.log(
        "[REDIS QUEUE BERHASIL] Berhasil terhubung ke redis untuk operasi antrian",
      );
    });
    this.queue.on("error", (err) => {
      console.log("[REDIS QUEUE ERROR] Gagal terhubung", err.message);
    });
  }

  public async disconnect() {
    await this.main.quit();
    await this.queue.quit();
    console.log("[KONEKSI REDIS BERHASIL DITUTUP]");
  }
}

export const redisLoader = new RedisLoader();
