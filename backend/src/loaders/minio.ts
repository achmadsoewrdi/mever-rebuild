import * as Minio from "minio";
import { env } from "../config/env";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: Number(env.MINIO_PORT),
  useSSL: false,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const initMinioBuckets = async () => {
  const buckets = [env.MINIO_BUCKET_SOURCE, env.MINIO_BUCKET_PUBLIC];

  for (const bucket of buckets) {
    try {
      const exist = await minioClient.bucketExists(bucket);
      if (!exist) {
        await minioClient.makeBucket(bucket, "us-east-1");
        console.log(`✅ Bucket '${bucket}' berhasil dibuat`); // fix: quote salah posisi
      } else {
        console.log(`ℹ️  Bucket '${bucket}' sudah ada`);
      }
    } catch (err) {
      console.error(`❌ Gagal inisialisasi bucket '${bucket}':`, err); // fix: pakai error bukan log
    }
  }
};
