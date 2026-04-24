import * as Minio from "minio";
import { env } from "../config/env";

// 1. Inisialisasi client langsung dieksekusi di level modul (tanpa constructor)
export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: Number(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

/**
 * 2. Fungsi murni untuk memastikan bucket wajib sudah tersedia
 */
export const initBuckets = async (): Promise<void> => {
  const buckets = [env.MINIO_BUCKET_SOURCE, env.MINIO_BUCKET_PUBLIC];

  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, "us-east-1");
        console.log(`[MINIO BERHASIL] bucket ${bucket} berhasil dibuat`);
      } else {
        console.log(`[MINIO INFO] Bucket ${bucket} sudah ada`);
      }
    } catch (err: any) {
      console.error(
        `[MINIO ERROR] Gagal Instalasi bucket ${bucket}:`,
        err.message,
      );
    }
  }
};
