import path from "path";
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
  const outputDir = path.dirname(outputPath);

  const runFfmpeg = (selectedCodec: string) => {
    return new Promise<void>((resolve, reject) => {
      let command = ffmpeg(sourcePath);

      // Untuk DASH, paksa CPU encoder agar kontainer fMP4 terjamin.
      // Hardware encoder (QSV/NVENC) dengan fluent-ffmpeg kadang menghasilkan
      // segmen .webm padahal ekstensi .m4s — ini yang menyebabkan MEDIA_ERR_DECODE.
      const effectiveCodec =
        packager === "dash" && (selectedCodec.includes("qsv") || selectedCodec.includes("nvenc") || selectedCodec.includes("amf"))
          ? codec === "h264" ? "libx264"
          : codec === "h265" || codec === "hevc" ? "libx265"
          : selectedCodec
          : selectedCodec;

      // Gunakan Opus untuk VP9 agar kompatibilitas dekoder lebih baik, selain itu pakai AAC
      const audioCodec = effectiveCodec.includes("vp9") ? "libopus" : "aac";

      command = command.videoCodec(effectiveCodec);
      command = command.audioCodec(audioCodec);
      command = command.size(`?x${resolutionHeight}`);

      // Preset per encoder
      if (effectiveCodec.includes("nvenc")) {
        command = command.addOption("-preset", "fast").addOption("-rc", "vbr").addOption("-cq", "23");
      } else if (effectiveCodec.includes("qsv")) {
        command = command.addOption("-preset", "veryfast").addOption("-global_quality", "23");
      } else if (effectiveCodec.includes("amf")) {
        command = command.addOption("-quality", "balanced");
      } else {
        // CPU encoder (libx264/libx265)
        command = command.addOption("-preset", "veryfast").addOption("-crf", "23");
      }

      // Paksa 8-bit yuv420p agar dapat diputar di semua browser
      // GOP 50 frame (~2 detik di 25fps) agar segmen streaming selalu dimulai keyframe
      command = command.addOption("-pix_fmt", "yuv420p").addOption("-g", "50").addOption("-threads", "0");

      if (packager === "hls") {
        command = command
          .addOption("-hls_time", "10")
          .addOption("-hls_list_size", "0")
          .addOption("-hls_segment_filename", path.join(outputDir, `${segmentPrefix}-%05d.ts`))
          .addOption("-f", "hls");
      } else if (packager === "dash") {
        const isVp9Like = effectiveCodec.includes("vp9") || effectiveCodec.includes("vp8") || effectiveCodec.includes("av1");
        const segmentExt = isVp9Like ? "webm" : "m4s";
        const segmentType = isVp9Like ? "webm" : "mp4";

        command = command
          .addOption("-movflags", "frag_keyframe+empty_moov+default_base_moof")
          .addOption("-use_template", "1")
          .addOption("-use_timeline", "1")
          .addOption("-seg_duration", "10")
          .addOption("-dash_segment_type", segmentType)
          .addOption("-init_seg_name", path.join(outputDir, `${segmentPrefix}-init-stream$RepresentationID$.${segmentExt}`))
          .addOption("-media_seg_name", path.join(outputDir, `${segmentPrefix}-chunk-stream$RepresentationID$-$Number%05d$.${segmentExt}`))
          .addOption("-adaptation_sets", "id=0,streams=v id=1,streams=a")
          .addOption("-f", "dash");
      } else {
        // plain: pilih format kontainer berdasarkan codec
        // VP9/AV1 → WebM | H.265 → MKV | H.264 → MP4
        if (effectiveCodec.includes("vp9") || effectiveCodec.includes("vp8") || effectiveCodec.includes("av1")) {
          command = command.addOption("-f", "webm");
        } else if (effectiveCodec.includes("x265") || effectiveCodec.includes("hevc")) {
          command = command.addOption("-f", "matroska"); // MKV
        } else {
          command = command.addOption("-movflags", "+faststart").addOption("-f", "mp4");
        }
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
            : codec === "vp9"
              ? "libvpx-vp9"
              : codec === "vp8"
                ? "libvpx"
                : codec === "av1"
                  ? "libsvtav1"
                  : codec;
      await runFfmpeg(fallbackCodec);
    } else {
      console.error(`[FFMPEG TRANSCODE ERROR] Gagal merender:`, err.message);
      throw err;
    }
  }
};
