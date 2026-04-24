import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

class FfmpegLoader {
  public client: typeof ffmpeg;

  constructor() {
    this.client = ffmpeg;
    this.client.setFfmpegPath(ffmpegInstaller.path);
  }

  // method untuk validasi
  public async verifyInstalation(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.getAvailableCodecs((err, codecs) => {
        if (err) {
          console.log("[FFMPEG ERROR] ffmpeg tidak ditemukan", err.message);
          console.log(
            "[FFMPEG INFO] Pastikan sudah menginstall ffmpeg di komputermu",
          );
          reject(err);
        } else {
          console.log("[FFMPEG SUKSES] FFMPEG terdeteksi dan siap digunakan");
          resolve();
        }
      });
    });
  }
}

export const ffmpegLoader = new FfmpegLoader();
