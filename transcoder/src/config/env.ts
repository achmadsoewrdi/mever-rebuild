// transcoder/src/config/env.ts

import { z } from "zod";
import dotenv from "dotenv";
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
});

export const env = envSchema.parse(process.env);
