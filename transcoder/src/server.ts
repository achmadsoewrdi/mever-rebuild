import { minioLoader } from "./loaders/minio";
import { ffmpegLoader } from "./loaders/ffmpeg";
import { postgresLoader } from "./loaders/postgres"; // <--- 1. Import postgresLoader

const startApp = async () => {
  try {
    console.log("Memulai inisialisasi layanan Transcoder...");

    // 2. Taruh inisialisasi Postgres paling atas
    await postgresLoader.connect();

    // Inisialisasi layanan yang lain
    await minioLoader.initBuckets();
    await ffmpegLoader.verifyInstalation();

    console.log("✅ Semua inisialisasi selesai.");
  } catch (error) {
    console.error("❌ Gagal memulai layanan:", error);
    process.exit(1);
  }
};

startApp();
