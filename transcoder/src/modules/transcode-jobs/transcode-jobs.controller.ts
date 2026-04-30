import fs from "fs/promises";
import path from "path";
import { createRedisConnection, redisMain } from "../../loaders/redis";
import { env } from "../../config/env";
import { generateUniqueSlug } from "../../utils/slug";
import { parseObjectName } from "../../utils/object-name-formatter";
import { getResolutionByRule } from "../../utils/resolution-rules";
import { getProtocol } from "../../utils/protocol-rules";
import { ffmpeg } from "../../loaders/ffmpeg";

import {
  downloadFromMinio,
  uploadToMinio,
  createThumbnail,
  transcodeVideo,
} from "./transcode-jobs.service";

import {
  createVideo,
  findVideoBySourcePath,
  updateVideoStatus,
  updateVideoTotalJobs,
  updateThumbnailUrl,
  updateVideoMetadata,
  incrementDoneJobs,
  createAsset,
} from "./videos.repository";

import {
  createManyJobs,
  updateJobStatus,
  updateJobProgress,
  setJobCompleted,
  setJobFailed,
  CreateJobData,
} from "./transcode-jobs.repository";

// =================================================================
// HELPER: Membaca resolusi asli video menggunakan FFprobe
// =================================================================

/**
 * Menganalisis file video untuk mengambil resolusi, durasi, dan ukuran file.
 *
 * @param filePath - Path absolut ke file video
 */
const getVideoMetadata = (
  filePath: string,
): Promise<{ height: number; duration: number; size: number }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video",
      );

      if (!videoStream || !videoStream.height) {
        return reject(new Error("Metadata video tidak valid."));
      }

      resolve({
        height: videoStream.height,
        duration: Math.round(metadata.format.duration || 0),
        size: metadata.format.size || 0,
      });
    });
  });
};

// =================================================================
// WORKER 1: PEMROSES ANTRIAN UPLOAD
// =================================================================

export const listenUploadQueue = async () => {
  const redisQueue = createRedisConnection();

  console.log(
    `[UPLOAD WORKER] Siap. Mendengarkan antrian: ${env.REDIS_QUEUE_UPLOAD_KEY}...`,
  );

  // Loop tak terbatas agar worker terus berjalan dan siap menerima job berikutnya
  while (true) {
    try {
      // BLPOP akan memblokir koneksi (idle/diam) hingga ada pesan masuk ke antrian.
      // Timeout 0 berarti menunggu selamanya tanpa batas waktu.
      const data = await redisQueue.blpop(env.REDIS_QUEUE_UPLOAD_KEY, 0);
      if (!data) continue;

      // Payload dari MinIO berformat array of event objects
      const payload = JSON.parse(data[1]);
      console.log(
        "[UPLOAD WORKER] Payload diterima dari MinIO:",
        JSON.stringify(payload, null, 2),
      );

      // Dekode URL untuk menangani karakter spesial pada nama file (mis: spasi → %20)
      const rawPath = decodeURIComponent(payload[0].Event[0].s3.object.key);
      const parsedName = parseObjectName(rawPath);
      const slug = generateUniqueSlug(parsedName.baseName);

      console.log(
        `\n[UPLOAD WORKER] Video baru terdeteksi: "${parsedName.fileName}"`,
      );

      // ---------------------------------------------------------------
      // Cari video di database berdasarkan sourcePath
      // Karena Backend sudah membuat record sebelum upload
      // ---------------------------------------------------------------
      let videoData = await findVideoBySourcePath(rawPath);
      
      if (!videoData) {
        console.log(`[UPLOAD WORKER] Peringatan: Record video tidak ditemukan, membuat record darurat...`);
        videoData = await createVideo({
          title: parsedName.baseName,
          slug: slug,
          sourcePath: rawPath,
          originalName: parsedName.fileName,
          status: "queued",
        });
      } else {
        await updateVideoStatus(videoData.id, "queued");
      }

      // ---------------------------------------------------------------
      // Siapkan direktori sementara untuk menyimpan file lokal
      // ---------------------------------------------------------------
      const tempDir = path.join(__dirname, "../../../temp");
      await fs.mkdir(tempDir, { recursive: true });

      const localSourcePath = path.join(tempDir, `${slug}-source.mp4`);

      // ---------------------------------------------------------------
      // Unduh video asli dari bucket MinIO ke penyimpanan lokal
      // Video diunduh SEKALI di sini, lalu path-nya dibagikan ke semua
      // job transcode agar mereka tidak perlu mengunduh ulang.
      // ---------------------------------------------------------------
      console.log(`[UPLOAD WORKER] Mengunduh video dari MinIO: ${rawPath}`);
      await downloadFromMinio(
        env.MINIO_BUCKET_SOURCE,
        rawPath,
        localSourcePath,
      );

      // ---------------------------------------------------------------
      // Analisis metadata video (Resolusi, Durasi, Ukuran)
      // ---------------------------------------------------------------
      const metadata = await getVideoMetadata(localSourcePath);
      const { height, duration, size } = metadata;

      console.log(
        `[UPLOAD WORKER] Metadata: ${height}p | ${duration}s | ${Math.round(size / 1024 / 1024)}MB`,
      );

      // Update metadata ke database
      await updateVideoMetadata(videoData.id, duration, size);

      // ---------------------------------------------------------------
      // Buat thumbnail dan unggah ke bucket publik MinIO
      // ---------------------------------------------------------------
      const thumbnailPath = await createThumbnail(
        localSourcePath,
        slug,
        tempDir,
      );
      const thumbnailMinioPath = `thumbnails/${slug}-thumb.png`;

      await uploadToMinio(
        thumbnailPath,
        env.MINIO_BUCKET_PUBLIC,
        thumbnailMinioPath,
      );
      await updateThumbnailUrl(
        videoData.id,
        `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_PUBLIC}/${thumbnailMinioPath}`,
      );

      // Hapus file thumbnail dari lokal setelah berhasil diunggah ke MinIO
      await fs.unlink(thumbnailPath);

      // ---------------------------------------------------------------
      // Menentukan daftar resolusi target berdasarkan aturan bisnis
      // Aturan: Jika video >= 720p → pecah ke beberapa resolusi (720p, 480p, 360p)
      //         Jika video < 720p  → render satu resolusi saja (resolusi aslinya)
      // ---------------------------------------------------------------
      const targetResolutions = getResolutionByRule(height);

      // ---------------------------------------------------------------
      // Buat data job render untuk setiap resolusi target
      // ---------------------------------------------------------------
      const codec = env.DEFAULT_CODEC;
      const packager = env.DEFAULT_PACKAGER;

      // Tentukan ekstensi file berdasarkan jenis packager
      const extension =
        packager === "hls" ? ".m3u8" : packager === "dash" ? ".mpd" : ".mp4";

      const jobsToInsert: CreateJobData[] = targetResolutions.map((res) => ({
        videoId: videoData.id,
        codec: codec,
        packager: packager,
        resolution: res.name,
        outputFilename: `${slug}-${res.name}${extension}`,
      }));

      // Simpan semua job ke database dan perbarui total job di record video
      const createdJobs = await createManyJobs(jobsToInsert);
      await updateVideoTotalJobs(videoData.id, createdJobs.length);
      await updateVideoStatus(videoData.id, "processing");

      for (const job of createdJobs) {
        if (!job.resolution) continue;

        const jobMessage = {
          jobId: job.id,
          videoId: videoData.id,
          sourcePath: rawPath,
          localSourcePath: localSourcePath,
          totalJobs: createdJobs.length,
          outputFilename: job.outputFilename,
          codec: job.codec,
          resolutionName: job.resolution,
          resolutionHeight: parseInt(job.resolution.replace("p", ""), 10),
          packager: job.packager,
          slug: slug,
        };

        await redisMain.lpush(
          env.REDIS_QUEUE_TRANSCODE_KEY,
          JSON.stringify(jobMessage),
        );
      }

      console.log(
        `[UPLOAD WORKER] Selesai. ${createdJobs.length} job render berhasil didistribusikan ke antrian.`,
      );
    } catch (err: any) {
      // Error ditangkap di sini agar loop tidak berhenti — worker tetap berjalan
      // dan siap memproses video berikutnya meskipun ada kegagalan.
      console.error("[UPLOAD WORKER] Gagal memproses video:", err.message);
    }
  }
};

// =================================================================
// WORKER 2: PEMROSES ANTRIAN TRANSCODE (RENDER)
// =================================================================

export const listenTranscodeQueue = async (workerId: string) => {
  // Koneksi Redis eksklusif per worker — WAJIB agar BLPOP tidak saling berebut
  const redisQueue = createRedisConnection();

  console.log(
    `[${workerId}] Siap. Mendengarkan antrian: ${env.REDIS_QUEUE_TRANSCODE_KEY}...`,
  );

  while (true) {
    // Deklarasi di luar try-catch agar bisa diakses oleh blok catch untuk pelaporan error
    let currentJobId: string | undefined;
    let currentSlug: string | undefined;
    let currentLocalSourcePath: string | undefined;

    try {
      const data = await redisQueue.blpop(env.REDIS_QUEUE_TRANSCODE_KEY, 0);
      if (!data) continue;

      const jobData = JSON.parse(data[1]);
      const {
        jobId,
        videoId,
        sourcePath,
        outputFilename,
        codec,
        resolutionHeight,
        resolutionName,
        packager,
        slug,
        totalJobs,
      } = jobData;

      currentJobId = jobId;
      currentSlug = slug;
      currentLocalSourcePath = jobData.localSourcePath;

      console.log(
        `\n[${workerId}] Memulai render — Job: ${jobId} | Resolusi: ${resolutionHeight}p`,
      );
      await updateJobStatus(jobId, "processing", workerId);

      // ---------------------------------------------------------------
      // Tentukan path file sumber (source video)
      // ---------------------------------------------------------------
      const tempDir = path.join(__dirname, "../../../temp");
      let localSourcePath: string = jobData.localSourcePath;

      try {
        // Cek keberadaan file lokal — jika ada, skip proses unduh
        await fs.access(localSourcePath);
        console.log(
          `[${workerId}] File source tersedia di lokal, melewati proses unduh.`,
        );
      } catch {
        // File tidak ditemukan di lokal — unduh dari MinIO sebagai fallback
        console.log(
          `[${workerId}] File source tidak ditemukan di lokal, mengunduh dari MinIO...`,
        );
        localSourcePath = path.join(tempDir, `${jobId}-source.mp4`);
        await downloadFromMinio(
          env.MINIO_BUCKET_SOURCE,
          sourcePath,
          localSourcePath,
        );
      }

      // ---------------------------------------------------------------
      // LANGKAH 2: Jalankan proses render (transcode) menggunakan FFmpeg
      // ---------------------------------------------------------------
      const localOutputPath = path.join(tempDir, outputFilename);

      await transcodeVideo(
        localSourcePath,
        localOutputPath,
        codec,
        resolutionHeight,
        packager,
        async (percent: number) => {
          await updateJobProgress(jobId, percent).catch(() => null);
        },
      );

      // ---------------------------------------------------------------
      // LANGKAH 3: Unggah hasil render (.m3u8) ke bucket publik MinIO
      // ---------------------------------------------------------------
      const minioOutputPath = `videos/${slug}/${resolutionName}/${outputFilename}`;
      await uploadToMinio(
        localOutputPath,
        env.MINIO_BUCKET_PUBLIC,
        minioOutputPath,
      );

      if (packager === "hls") {
        const files = await fs.readdir(tempDir);

        for (const file of files) {
          // Filter hanya file segmen .ts milik job/resolusi ini
          if (
            file.startsWith(`${slug}-${resolutionName}`) &&
            file.endsWith(".ts")
          ) {
            const minioTsPath = `videos/${slug}/${resolutionName}/${file}`;

            await uploadToMinio(
              path.join(tempDir, file),
              env.MINIO_BUCKET_PUBLIC,
              minioTsPath,
            );

            // Hapus segmen dari lokal setelah berhasil diunggah
            await fs.unlink(path.join(tempDir, file)).catch(() => null);
          }
        }
      }

      // ---------------------------------------------------------------
      // LANGKAH 5: Simpan aset video (hasil render) ke database
      // ---------------------------------------------------------------
      const protocol = getProtocol(codec, packager);
      const newAsset = await createAsset({
        videoId,
        jobId,
        codec,
        format: packager === "hls" ? "mp4" : "webm",
        protocol,
        resolution: resolutionName,
        manifestUrl: `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_PUBLIC}/${minioOutputPath}`,
      });

      // Tandai job ini sebagai selesai di database
      await setJobCompleted(jobId, newAsset.id);

      // ---------------------------------------------------------------
      // LANGKAH 6: Perbarui penghitung job selesai dan cek penyelesaian total
      // ---------------------------------------------------------------

      // Hapus file output dari lokal setelah berhasil diunggah ke MinIO
      await fs.unlink(localOutputPath).catch(() => null);

      // Tambahkan hitungan job selesai secara atomik di database
      const videoStats = await incrementDoneJobs(videoId);
      const doneCount = videoStats.doneJobs ?? 0;
      const totalCount = videoStats.totalJobs ?? totalJobs;

      console.log(
        `[${workerId}] Render ${resolutionHeight}p selesai! (${doneCount}/${totalCount})`,
      );

      // Cek apakah semua resolusi untuk video ini sudah selesai dirender
      if (doneCount >= totalCount) {
        console.log(`\n[${workerId}] Semua resolusi selesai untuk video ini!`);

        await updateVideoStatus(videoId, "ready");

        await fs.unlink(localSourcePath).catch(() => null);

        console.log(
          `[${workerId}] File source lokal dihapus. Video siap ditayangkan.`,
        );
      }
    } catch (err: any) {
      console.error(`[${workerId}] Gagal merender video:`, err.message);

      if (currentJobId) {
        await setJobFailed(currentJobId, err.message).catch(() => null);
      }

      // Bersihkan file temp yang mungkin terbuat sebelum error terjadi
      try {
        const tempDir = path.join(__dirname, "../../../temp");
        if (currentSlug) {
          const files = await fs.readdir(tempDir);
          for (const file of files) {
            if (file.startsWith(currentSlug)) {
              await fs.unlink(path.join(tempDir, file)).catch(() => null);
            }
          }
          console.log(
            `[${workerId}] File temp sisa dari job yang gagal berhasil dibersihkan.`,
          );
        }
        // Hapus file source jika ada
        if (currentLocalSourcePath) {
          await fs.unlink(currentLocalSourcePath).catch(() => null);
        }
      } catch {
        // abaikan error cleanup
      }
    }
  }
};
