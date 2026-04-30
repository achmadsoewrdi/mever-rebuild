import { minioClient } from "../../loaders/minio";
import { ffmpeg } from "../../loaders/ffmpeg";
import { getBestEncoder } from "../../utils/hardware-acceleration";

// ==========================================
// A. LAYANAN MINIO (STORAGE)
// ==========================================

// download from minio
export const downloadFromMinio = async (
  bucket: string,
  objectName: string,
  LocalPath: string,
): Promise<void> => {
  try {
    await minioClient.fGetObject(bucket, objectName, LocalPath);
    console.log(`[MINIO DOWNLOAD] sukses: ${objectName}`);
  } catch (err: any) {
    console.error(
      `[MINIO DOWNLOAD ERROR] Gagal mengunduh:${LocalPath}:`,
      err.message,
    );
    throw err;
  }
};

// upload to minio
export const uploadToMinio = async (
  localPath: string,
  bucket: string,
  objectName: string,
): Promise<void> => {
  try {
    await minioClient.fPutObject(bucket, objectName, localPath, {});
    console.log(`[MINIO UPLOAD] sukses: ${objectName}`);
  } catch (err: any) {
    console.error(
      `[MINIO UPLOAD ERROR] Gagal mengunggah ${localPath}:`,
      err.message,
    );
    throw err;
  }
};

// remove from minio
export const removeFromMinio = async (
  bucket: string,
  objectName: string,
): Promise<void> => {
  try {
    await minioClient.removeObject(bucket, objectName);
    console.log(`[MINIO BERHASIL MENGHAPUS] sukses: ${objectName}`);
  } catch (err: any) {
    console.error(`[MINIO GAGAL MENGHAPUS] gagal: ${objectName}:`, err.message);
    throw err;
  }
};

// ==========================================
// B. LAYANAN FFMPEG (PROCESSING)
// ==========================================

// mengambil thumnail dari video
export const createThumbnail = async (
  sourcePath: string,
  slug: string,
  outputDir: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filename = `${slug}-thumb.png`;
    ffmpeg(sourcePath)
      .screenshot({
        timestamps: ["00:00:02.000"],
        folder: outputDir,
        filename: filename,
        size: "1280x720",
      })
      .on("end", () => {
        console.log(`[FFMPEG THUMBNAIL] Selesai: ${filename}`);
        resolve(`${outputDir}/${filename}`);
      })
      .on("error", (err) => {
        console.error(
          "[FFMPEG THUMBNAIL ERROR] Gagal menjepret Gambar:",
          err.message,
        );
        reject(err);
      });
  });
};

// fungsi Utama Transcoder
export const transcodeVideo = async (
  sourcePath: string,
  outputPath: string,
  codec: string,
  resolutionHeight: number,
  packager: "hls" | "dash" | "plain",
  segmentPrefix: string,
  onProgress: (percent: number) => void,
): Promise<void> => {
  const bestCodec = await getBestEncoder(codec as any);
  console.log(
    `[FFMPEG] Menggunakan encoder: ${bestCodec} untuk codec: ${codec}`,
  );

  const runFfmpeg = (selectedCodec: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(sourcePath);
      command = command.videoCodec(selectedCodec);
      command = command.audioCodec("aac");
      command = command.size(`?x${resolutionHeight}`);

      // GPU Encoders usually have different preset names
      if (selectedCodec.includes("nvenc")) {
        command = command
          .addOption("-preset", "fast") // Menggunakan nama preset lama (fast/medium/slow) untuk kompatibilitas
          .addOption("-rc", "vbr")
          .addOption("-cq", "23");
      } else if (selectedCodec.includes("qsv")) {
        command = command
          .addOption("-preset", "veryfast")
          .addOption("-global_quality", "23");
      } else if (selectedCodec.includes("amf")) {
        command = command.addOption("-quality", "balanced");
      } else {
        // Default CPU (libx264/libx265)
        command = command
          .addOption("-preset", "veryfast")
          .addOption("-crf", "23");
      }

      command = command
        .addOption("-threads", "0")
        .addOption("-movflags", "+faststart");

      if (packager === "hls") {
        command = command
          .addOption("-hls_time", "10")
          .addOption("-hls_list_size", "0")
          .addOption("-f", "hls");
      } else if (packager === "dash") {
        command = command
          .addOption("-use_template", "1")
          .addOption("-use_timeline", "1")
          .addOption("-seg_duration", "10")
          // Gunakan prefix agar tidak berantakan di root
          .addOption("-init_seg_name", `${segmentPrefix}-init-stream$RepresentationID$.$ext$`)
          .addOption("-media_seg_name", `${segmentPrefix}-chunk-stream$RepresentationID$-$Number%05d$.$ext$`)
          .addOption("-f", "dash");
      } else {
        command = command.addOption("-f", "mp4");
      }

      command
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log(`[FFMPEG COMMAND] ${commandLine}`);
        })
        .on("progress", (progress) => {
          if (progress.percent && !isNaN(progress.percent)) {
            onProgress(Math.round(progress.percent));
          }
        })
        .on("end", () => {
          console.log(`[FFMPEG TRANSCODE] Selesai merender: ${outputPath}`);
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          if (stderr) {
            console.error(`[FFMPEG STDERR]`, stderr);
          }
          reject(err);
        })
        .run();
    });
  };

  try {
    await runFfmpeg(bestCodec);
  } catch (err: any) {
    // Jika gagal menggunakan hardware encoder, coba fallback ke CPU
    const isHardware =
      bestCodec.includes("nvenc") ||
      bestCodec.includes("qsv") ||
      bestCodec.includes("amf");

    if (isHardware) {
      console.warn(
        `[FFMPEG FALLBACK] Hardware encoder (${bestCodec}) gagal. Mencoba dengan CPU...`,
      );
      const fallbackCodec =
        codec === "h264"
          ? "libx264"
          : codec === "h265" || codec === "hevc"
            ? "libx265"
            : codec;
      await runFfmpeg(fallbackCodec);
    } else {
      console.error(`[FFMPEG TRANSCODE ERROR] Gagal merender:`, err.message);
      throw err;
    }
  }
};
