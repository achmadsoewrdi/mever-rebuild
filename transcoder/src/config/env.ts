// transcoder/src/config/env.ts

import { z } from "zod";
import dotenv from "dotenv";
import os from "os";
dotenv.config();

console.log("RAW DATABASE_URL:", process.env.DATABASE_URL);

const envSchema = z.object({
  // PostgreSQL
  DATABASE_URL: z.string().min(1, "DATABASE_URL tidak boleh kosong"),

  // Redis
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASS: z.string().optional(),
  REDIS_QUEUE_UPLOAD_KEY: z.string().default("queue:upload"),
  REDIS_QUEUE_TRANSCODE_KEY: z.string().default("queue:transcode"),
  REDIS_QUEUE_TIMEOUT: z.string().default("600"),

  // MinIO
  MINIO_ENDPOINT: z.string().min(1, "MINIO_ENDPOINT tidak boleh kosong"),
  MINIO_PORT: z.string().default("9000"),
  MINIO_USE_SSL: z.string().default("false"),
  MINIO_ACCESS_KEY: z.string().min(1, "MINIO_ACCESS_KEY tidak boleh kosong"),
  MINIO_SECRET_KEY: z.string().min(1, "MINIO_SECRET_KEY tidak boleh kosong"),
  MINIO_BUCKET_SOURCE: z.string().default("source"),
  MINIO_BUCKET_PUBLIC: z.string().default("public"),

  // Worker Info
  WORKER_ID: z.string().default("worker-1"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Jumlah worker transcode yang dijalankan secara paralel.
  // Default: (jumlah CPU - 1), minimal 1.
  // Contoh: mesin dengan 8 core → default 7 workers.
  TRANSCODE_WORKER_COUNT: z.coerce
    .number()
    .int()
    .min(1, "TRANSCODE_WORKER_COUNT minimal 1")
    .default(Math.max(1, os.cpus().length - 1)),

  // Default Transcode Settings
  DEFAULT_CODEC: z.enum(["h264", "h265", "vp9", "vp8", "av1"]).default("h264"),
  DEFAULT_PACKAGER: z.enum(["hls", "dash", "plain"]).default("hls"),
});

export const env = envSchema.parse(process.env);
