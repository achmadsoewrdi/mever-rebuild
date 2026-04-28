import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const schema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASS: z.string().optional(),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.string().default("9000"),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET_SOURCE: z.string().default("source"),
  MINIO_BUCKET_PUBLIC: z.string().default("public"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ENCRYPTION_KEY: z.string().min(32),
});

export const env = schema.parse(process.env);
