import { spawn } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

export interface HardwareSupport {
  nvenc: boolean;
  amf: boolean;
  qsv: boolean;
}

let cachedSupport: HardwareSupport | null = null;

const FFMPEG_PATH = ffmpegInstaller.path;

/**
 * Test apakah sebuah encoder bisa beneran dipakai dengan menjalankan
 * encode singkat ke /dev/null (atau NUL di Windows). Ini lebih akurat
 * daripada hanya memeriksa daftar encoder yang dikompilasi.
 */
const testEncoder = (encoder: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const args = [
      "-f", "lavfi",
      "-i", "nullsrc=s=128x128:d=1",
      "-vcodec", encoder,
      "-an",
      "-f", "null",
      "-",
    ];

    const proc = spawn(FFMPEG_PATH, args, { stdio: "pipe" });

    let exited = false;
    const done = (ok: boolean) => {
      if (!exited) {
        exited = true;
        resolve(ok);
      }
    };

    proc.on("close", (code) => done(code === 0));
    proc.on("error", () => done(false));

    // Timeout 10 detik — kalau lebih dari itu, anggap gagal
    setTimeout(() => {
      if (!exited) {
        proc.kill();
        done(false);
      }
    }, 10000);
  });
};

/**
 * Mendeteksi dukungan hardware encoder secara akurat dengan
 * menjalankan test encode singkat untuk setiap encoder GPU.
 */
export const detectHardwareSupport = async (): Promise<HardwareSupport> => {
  if (cachedSupport) return cachedSupport;

  console.log("[GPU DETECTION] Menguji ketersediaan hardware encoder...");

  const [nvenc, amf, qsv] = await Promise.all([
    testEncoder("h264_nvenc").then((ok) => {
      console.log(`[GPU DETECTION] NVENC: ${ok ? "✅ Tersedia" : "❌ Tidak tersedia"}`);
      return ok;
    }),
    testEncoder("h264_amf").then((ok) => {
      console.log(`[GPU DETECTION] AMF  : ${ok ? "✅ Tersedia" : "❌ Tidak tersedia"}`);
      return ok;
    }),
    testEncoder("h264_qsv").then((ok) => {
      console.log(`[GPU DETECTION] QSV  : ${ok ? "✅ Tersedia" : "❌ Tidak tersedia"}`);
      return ok;
    }),
  ]);

  cachedSupport = { nvenc, amf, qsv };
  return cachedSupport;
};

/**
 * Mengambil encoder terbaik untuk codec tertentu.
 * Prioritas: NVENC > QSV > AMF > CPU fallback
 */
export const getBestEncoder = async (
  codec: string,
): Promise<string> => {
  const support = await detectHardwareSupport();

  if (codec === "h264") {
    if (support.nvenc) return "h264_nvenc";
    if (support.qsv) return "h264_qsv";
    if (support.amf) return "h264_amf";
    return "libx264";
  }

  if (codec === "h265" || codec === "hevc") {
    if (support.nvenc) return "hevc_nvenc";
    if (support.qsv) return "hevc_qsv";
    if (support.amf) return "hevc_amf";
    return "libx265";
  }

  if (codec === "vp9") {
    return "libvpx-vp9";
  }

  if (codec === "vp8") {
    return "libvpx";
  }

  if (codec === "av1") {
    return "libsvtav1";
  }

  return codec;
};
