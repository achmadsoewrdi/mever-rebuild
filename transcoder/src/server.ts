import { initBuckets } from "./loaders/minio";
import { verifyFfmpegInstallation } from "./loaders/ffmpeg";
import { connectPostgres } from "./loaders/postgres";
import { redisMain } from "./loaders/redis";
import { env } from "./config/env";
import {
  listenUploadQueue,
  listenTranscodeQueue,
} from "./modules/transcode-jobs/transcode-jobs.controller";

const startApp = async () => {
  try {
    console.log("==================================================");
    console.log("🚀 Memulai Inisialisasi Layanan Transcoder...");
    console.log("==================================================\n");

    // 1. Uji Koneksi Database (PostgreSQL)
    await connectPostgres();

    // 2. Uji Koneksi dan Persiapan Bucket (MinIO)
    await initBuckets();

    // 3. Uji Ketersediaan FFmpeg
    await verifyFfmpegInstallation();

    // 4. Uji Koneksi Redis (Utama)
    await redisMain.ping();
    console.log("[REDIS PING] Sukses! Redis siap mendengarkan antrean.");

    console.log("\n==================================================");
    console.log("✅ SEMUA INFRASTRUKTUR BERJALAN NORMAL!");
    console.log(`▶️ Menyalakan Worker [${env.WORKER_ID}]...\n`);
    console.log("==================================================");

    listenUploadQueue();
    const TRANSCODE_WORKER_COUNT = 3;
    for (let i = 1; i <= TRANSCODE_WORKER_COUNT; i++) {
      listenTranscodeQueue(`worker-transcode-${i}`);
    }
  } catch (error) {
    console.error("\n❌ TERJADI KESALAHAN FATAL SAAT INISIALISASI:", error);
    process.exit(1);
  }
};

startApp();
