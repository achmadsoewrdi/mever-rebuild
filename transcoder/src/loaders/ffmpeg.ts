import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
export const verifyFfmpegInstallation = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.getAvailableCodecs((err) => {
      if (err) {
        console.error("[FFMPEG ERROR] ffmpeg tidak ditemukan", err.message);
        console.error(
          "[FFMPEG INFO] Pastikan sudah menginstall ffmpeg di komputermu",
        );
        reject(err);
      } else {
        console.log("[FFMPEG SUKSES] FFMPEG terdeteksi dan siap digunakan");
        resolve();
      }
    });
  });
};

export { ffmpeg };
