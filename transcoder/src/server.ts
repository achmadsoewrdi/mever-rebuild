import { minioLoader } from "./loaders/minio";
import { ffmpegLoader } from "./loaders/ffmpeg"; // <-- 1. Import ffmpegLoader

const startApp = async () => {
  try {
    console.log("Memulai inisialisasi layanan Transcoder...");

    // Inisialisasi MinIO
    await minioLoader.initBuckets();

    // 2. Inisialisasi pengecekan FFmpeg
    // (Perhatikan ejaannya sesuai dengan yang kamu ketik, yaitu verifyInstalation)
    await ffmpegLoader.verifyInstalation();

    console.log("✅ Semua inisialisasi selesai.");
  } catch (error) {
    console.error("❌ Gagal memulai layanan:", error);
    process.exit(1);
  }
};

startApp();
