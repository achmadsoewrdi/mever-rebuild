import { minioClient } from "../../loaders/minio";
import { ffmpeg } from "../../loaders/ffmpeg";

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
  onProgress: (percent: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(sourcePath);
    if (codec === "h264") {
      command = command.videoCodec("libx264");
    } else if (codec === "h265" || codec === "hevc") {
      command = command.videoCodec("libx265");
    } else if (codec === "vp9") {
      command = command.videoCodec("libvpx-vp9");
    } else if (codec === "vp8") {
      command = command.videoCodec("libvpx");
    } else if (codec === "av1") {
      command = command.videoCodec("libaom-av1");
    }

    command = command.audioCodec("aac");

    command = command.size(`?x${resolutionHeight}`);
    command = command
      .addOption("-preset", "veryfast") // ← ini paling penting! tradeoff speed vs filesize
      .addOption("-crf", "23") // quality constant (18=bagus, 28=kecil, 23=balance)
      .addOption("-threads", "2") // batasi per proses, jangan berebut CPU
      .addOption("-movflags", "+faststart");

    if (packager === "hls") {
      command = command
        .addOption("-hls_time", "10")
        .addOption("-hls_list_size", "0")
        .addOption("-f", "hls");
    } else if (packager === "dash") {
      command = command.addOption("-f", "dash");
    } else {
      command = command.addOption("-f", "mp4");
    }

    command
      .output(outputPath)
      .on("progress", (progress) => {
        if (progress.percent && !isNaN(progress.percent)) {
          // Melempar angka ke atas agar dicatat oleh database (lewat fungsi callback)
          onProgress(Math.round(progress.percent));
        }
      })
      .on("end", () => {
        console.log(`[FFMPEG TRANSCODE] Selesai merender: ${outputPath}`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`[FFMPEG TRANSCODE ERROR] Gagal merender:`, err.message);
        reject(err);
      })
      .run();
  });
};
