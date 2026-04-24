import * as Minio from "minio";
import { env } from "../config/env";

class MinioLoader {
  public client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      endPoint: env.MINIO_ENDPOINT,
      port: Number(env.MINIO_PORT),
      useSSL: env.MINIO_USE_SSL === "true",
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }

  //   method class
  public async initBuckets(): Promise<void> {
    const buckets = [env.MINIO_BUCKET_SOURCE, env.MINIO_BUCKET_PUBLIC];
    for (const bucket of buckets) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket, "us-east-1");
          console.log(`[MINIO BERHASIL] bucker: ${bucket} berhasil dibuat`);
        } else {
          console.log(`[MINIO INFO] Bucker ${bucket} sudah ada`);
        }
      } catch (err: any) {
        console.error(
          `[MINIO ERROR] Gagal Instalasi bucket ${bucket} :`,
          err.message,
        );
      }
    }
  }
}

export const minioLoader = new MinioLoader();
