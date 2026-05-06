import fs from "fs/promises";
import path from "path";
import { createRedisConnection, redisMain } from "../../loaders/redis";
import { env } from "../../config/env";
import { generateUniqueSlug } from "../../utils/slug";
import { parseObjectName } from "../../utils/object-name-formatter";
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
  getActiveQualityPresets,
  CreateJobData,
} from "./transcode-jobs.repository";

// =================================================================
// HELPER: Cache Invalidation (Sinkron dengan Backend)
// =================================================================
const invalidateVideosCache = async (videoId?: string) => {
  try {
    const keys = await redisMain.keys("cache:videos:*");
    if (keys.length > 0) {
      await redisMain.del(keys);
    }
    if (videoId) {
      await redisMain.del(`cache:video:${videoId}`);
    }
    console.log("[CACHE INVALIDATED] Berhasil menghapus cache video");
  } catch (err) {
    console.error("Gagal menghapus cache dari transcoder:", err);
  }
};

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
): Promise<{ height: number; duration: number; size: number; codec: string; formatName: string }> => {
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
        codec: videoStream.codec_name || "h264",
        formatName: metadata.format.format_name || "mp4",
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
        console.log(
          `[UPLOAD WORKER] Peringatan: Record video tidak ditemukan, membuat record darurat...`,
        );
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

      // Hapus cache agar status 'queued' langsung terlihat
      await invalidateVideosCache(videoData.id);

      // ---------------------------------------------------------------
      // Siapkan direktori sementara untuk menyimpan file lokal
      // ---------------------------------------------------------------
      const tempDir = path.join(__dirname, "../../../temp");
      await fs.mkdir(tempDir, { recursive: true });

      // Gunakan videoId agar UNIK dan tidak tabrakan jika ada slug yang sama
      const localSourcePath = path.join(tempDir, `${videoData.id}-source.mp4`);

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
      // Analisis metadata video (Resolusi, Durasi, Ukuran, Codec, Format)
      // ---------------------------------------------------------------
      const metadata = await getVideoMetadata(localSourcePath);
      const { height, duration, size, codec, formatName } = metadata;

      console.log(
        `[UPLOAD WORKER] Metadata: ${height}p | ${duration}s | ${Math.round(size / 1024 / 1024)}MB | Codec: ${codec} | Format: ${formatName}`,
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
      // Tentukan daftar resolusi target berdasarkan preset dari database
      // ---------------------------------------------------------------
      const activePresets = await getActiveQualityPresets();

      if (activePresets.length === 0) {
        console.warn("[UPLOAD WORKER] Peringatan: Tidak ada quality preset yang aktif di database!");
      }

      // ---------------------------------------------------------------
      // KONSTRUKSI DISTRIBUTION SUITE BERDASARKAN PRESET
      // ---------------------------------------------------------------
      const jobsToInsert: CreateJobData[] = [];
      const jobMessages: any[] = [];

      const getExtension = (formatStr: string) => {
        const fmt = formatStr?.toLowerCase() || "";
        if (fmt.includes("hls")) return "m3u8";
        if (fmt.includes("dash")) return "mpd";
        if (fmt.includes("webm")) return "webm";
        if (fmt.includes("mkv")) return "mkv";
        return "mp4";
      };

      // Helper untuk ekstrak tinggi (height) dari string resolusi (misal "1080p" -> 1080, "4k" -> 2160)
      const parseResolutionHeight = (resString: string | null) => {
        if (!resString) return 0;
        const lower = resString.toLowerCase();
        if (lower === "4k") return 2160;
        if (lower === "2k") return 1440;
        return parseInt(lower.replace(/\D/g, ""), 10) || 0;
      };

      // 1. Urutkan preset dari resolusi tertinggi ke terendah
      const sortedPresets = [...activePresets].sort((a, b) => {
        return parseResolutionHeight(b.resolution) - parseResolutionHeight(a.resolution);
      });

      // 2. Cari index preset pertama yang tingginya <= tinggi video sumber (kasih toleransi 50px)
      const closestIndex = sortedPresets.findIndex((preset) => {
        return parseResolutionHeight(preset.resolution) <= height + 50;
      });

      let finalPresetsToRender: any[] = [];

      if (closestIndex === -1) {
        // Jika video SANGAT KECIL (lebih kecil dari preset terkecil sekalipun)
        // Paksa ambil 1 preset yang paling kecil agar tetap bisa diputar
        finalPresetsToRender = sortedPresets.length > 0 ? [sortedPresets[sortedPresets.length - 1]] : [];
      } else {
        // 3. Terapkan aturan batas jumlah downscale
        if (height < 720) {
          // Jika video di bawah 720p (misal 480p atau 360p), JANGAN downscale lagi. Ambil 1 saja.
          finalPresetsToRender = sortedPresets.slice(closestIndex, closestIndex + 1);
        } else {
          // Jika video 720p ke atas, ambil preset aslinya + MAKSIMAL 2 preset di bawahnya (Total 3)
          // Contoh 1080p -> 1080p, 720p, 480p
          // Contoh 4K -> 4K, 1440p, 1080p (berhenti di 1080p, tidak lanjut ke 720p/480p)
          finalPresetsToRender = sortedPresets.slice(closestIndex, closestIndex + 3);
        }
      }

      for (const preset of finalPresetsToRender) {
        const outputFilename = `${slug}-${preset.name}.${getExtension(preset.format || "mp4")}`;
        
        jobsToInsert.push({
          videoId: videoData.id,
          presetId: preset.id,
          outputFilename,
        });

        const packagerFormat = preset.format?.toLowerCase() || "";
        const packager = packagerFormat.includes("hls") ? "hls" : packagerFormat.includes("dash") ? "dash" : "plain";
        const resolutionHeight = parseResolutionHeight(preset.resolution) || 720;

        jobMessages.push({
          videoId: videoData.id,
          presetId: preset.id,
          sourcePath: rawPath,
          localSourcePath: localSourcePath,
          outputFilename: outputFilename,
          codec: preset.codec || "h264",
          resolutionName: preset.name,
          resolutionHeight: resolutionHeight,
          packager: packager,
          slug: slug,
        });
      }

      console.log(
        `[UPLOAD WORKER] Generating Distribution Suite: ${jobsToInsert.length} jobs based on active presets.`,
      );

      // Simpan semua job ke database dan perbarui total job di record video
      let createdJobs: any[] = [];
      if (jobsToInsert.length > 0) {
        createdJobs = await createManyJobs(jobsToInsert);
      }
      
      await updateVideoTotalJobs(videoData.id, createdJobs.length);
      await updateVideoStatus(videoData.id, "processing");

      for (let i = 0; i < createdJobs.length; i++) {
        const job = createdJobs[i];
        const jobMessage = jobMessages[i];
        jobMessage.jobId = job.id;
        jobMessage.totalJobs = createdJobs.length;

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
        presetId,
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
        `\n[${workerId}] Memulai render — Job: ${jobId} | Resolusi: ${resolutionName}`,
      );
      await updateJobStatus(jobId, "processing", workerId);

      // Invalidate cache agar status 'processing' terlihat di dashboard
      await invalidateVideosCache(videoId);

      // ---------------------------------------------------------------
      // Tentukan path file sumber (source video)
      // ---------------------------------------------------------------
      const tempDir = path.join(__dirname, "../../../temp");
      let localSourcePath: string = jobData.localSourcePath;

      try {
        // Cek keberadaan file lokal — jika ada, skip proses unduh
        await fs.access(localSourcePath);
      } catch {
        // File tidak ditemukan di lokal — unduh dari MinIO sebagai fallback
        console.log(
          `[${workerId}] File source tidak ditemukan di lokal, mengunduh dari MinIO...`,
        );
        // Fallback tetap gunakan videoId agar konsisten
        localSourcePath = path.join(tempDir, `${videoId}-source.mp4`);
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
        `${slug}-${resolutionName}`, // segmentPrefix
        async (percent: number) => {
          await updateJobProgress(jobId, percent).catch(() => null);
        },
      );

      // ---------------------------------------------------------------
      // POST-PROCESS: Perbaiki path absolut Windows di manifest .mpd
      // ---------------------------------------------------------------
      // FFmpeg di Windows kadang menulis path absolut (D:\...\temp\) ke dalam
      // template segmen di manifest .mpd, sehingga browser mencoba akses
      // file:/// lokal alih-alih URL MinIO yang benar.
      // Solusi: Strip semua path absolut, sisakan hanya nama file.
      if (packager === "dash" && outputFilename.endsWith(".mpd")) {
        try {
          let mpdContent = await fs.readFile(localOutputPath, "utf-8");

          // Ganti path Windows (baik dengan \ maupun /) dengan string kosong
          // agar hanya nama file yang tersisa di dalam template segmen.
          // Contoh: D:/MAGANG/.../temp/video-chunk → video-chunk
          //         D:\MAGANG\...\temp\video-chunk → video-chunk
          const normalizedTempDir = tempDir.replace(/\\/g, "/");
          const escapedForwardSlash = normalizedTempDir.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const escapedBackslash = tempDir
            .replace(/\\/g, "\\\\")
            .replace(/[.*+?^${}()|[\]]/g, "\\$&");

          // Hapus tempDir prefix (forward slash maupun backslash)
          mpdContent = mpdContent
            .replace(new RegExp(escapedForwardSlash + "/", "g"), "")
            .replace(new RegExp(escapedBackslash + "\\\\", "g"), "");

          await fs.writeFile(localOutputPath, mpdContent, "utf-8");
          console.log(
            `[DASH] Berhasil memperbaiki path di manifest MPD: ${outputFilename}`,
          );
        } catch (fixErr: any) {
          console.warn(
            `[DASH] Gagal memperbaiki path MPD (non-fatal):`,
            fixErr.message,
          );
        }
      }

      // ---------------------------------------------------------------
      // LANGKAH 3: Unggah hasil render (manifest) ke bucket publik MinIO
      // ---------------------------------------------------------------
      const minioOutputPath = `videos/${slug}/${resolutionName}/${outputFilename}`;
      await uploadToMinio(
        localOutputPath,
        env.MINIO_BUCKET_PUBLIC,
        minioOutputPath,
      );

      // ---------------------------------------------------------------
      // LANGKAH 4: Unggah file segmen (HLS/DASH) ke MinIO & Bersihkan
      // ---------------------------------------------------------------
      if (packager === "hls" || packager === "dash") {
        const files = await fs.readdir(tempDir);
        const segmentPrefix = `${slug}-${resolutionName}`;

        for (const file of files) {
          // Identifikasi apakah file ini adalah bagian dari streaming
          const isHlsSegment =
            packager === "hls" &&
            file.startsWith(segmentPrefix) &&
            file.endsWith(".ts");
          const isDashFmp4Segment =
            packager === "dash" &&
            file.startsWith(segmentPrefix) &&
            (file.includes("chunk-stream") || file.includes("init-stream")) &&
            (file.endsWith(".m4s") || file.endsWith(".webm"));

          if (isHlsSegment || isDashFmp4Segment) {
            const minioSegPath = `videos/${slug}/${resolutionName}/${file}`;

            await uploadToMinio(
              path.join(tempDir, file),
              env.MINIO_BUCKET_PUBLIC,
              minioSegPath,
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
        presetId,
        jobId,
        codec,
        format:
          packager === "dash" ? "mpd" : packager === "hls" ? "m3u8" : "mp4",
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
        `[${workerId}] Render ${resolutionName} selesai! (${doneCount}/${totalCount})`,
      );

      // Cek apakah semua resolusi untuk video ini sudah selesai dirender
      if (doneCount >= totalCount) {
        console.log(`\n[${workerId}] Semua resolusi selesai untuk video ini!`);

        await updateVideoStatus(videoId, "ready");
        await invalidateVideosCache(videoId);

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
            // Hapus file output/segmen yang berhubungan dengan slug ini
            if (file.startsWith(currentSlug)) {
              await fs.unlink(path.join(tempDir, file)).catch(() => null);
            }
          }
          console.log(
            `[${workerId}] File temp (output/segmen) dari job yang gagal berhasil dibersihkan.`,
          );
        }
      } catch {
        // abaikan error cleanup
      }
    }
  }
};
