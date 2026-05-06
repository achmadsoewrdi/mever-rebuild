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

  // Tambahkan setup notifikasi setelah bucket dipastikan ada
  await setupNotifications();
};

/**
 * 3. Mengatur Notifikasi Bucket agar mengirim event ke Redis
 */
const setupNotifications = async () => {
  const bucketName = env.MINIO_BUCKET_SOURCE;
  const redisArn = `arn:minio:sqs::primary:redis`; // Nama target default di MinIO

  try {
    const config = new Minio.NotificationConfig();
    const queueConfig = new Minio.QueueConfig(redisArn);

    // WAJIB: Tentukan event apa yang ingin didengarkan (saat file dibuat)
    queueConfig.addEvent("s3:ObjectCreated:*");

    // Filter agar hanya memproses file video tertentu jika perlu
    // queueConfig.addFilterSuffix('.mp4');

    config.add(queueConfig);

    await minioClient.setBucketNotification(bucketName, config);
    console.log(`[MINIO NOTIFIKASI] Berhasil mengaktifkan notifikasi ke Redis`);
  } catch (err: any) {
    console.warn(
      `[MINIO WARNING] Gagal mengatur notifikasi otomatis: ${err.message}`,
    );
    console.log(`[TIPS] Pastikan MinIO sudah dikonfigurasi untuk Redis target.`);
  }
};
