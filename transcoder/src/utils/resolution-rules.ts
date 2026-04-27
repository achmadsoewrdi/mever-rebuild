export type VideoResolution = {
  name: string;
  height: number;
  width: number;
  videoBitrate: string;
};

/**
 * Daftar resolusi standar yang diurutkan dari TERTINGGI ke TERENDAH.
 * Digunakan sebagai referensi untuk menentukan target render.
 */
const STANDARD_RESOLUTIONS: VideoResolution[] = [
  { name: "4k",    height: 2160, width: 3840, videoBitrate: "15000k" },
  { name: "1440p", height: 1440, width: 2560, videoBitrate: "8000k"  },
  { name: "1080p", height: 1080, width: 1920, videoBitrate: "4000k"  },
  { name: "720p",  height: 720,  width: 1280, videoBitrate: "2500k"  },
  { name: "480p",  height: 480,  width: 854,  videoBitrate: "1000k"  },
  { name: "360p",  height: 360,  width: 640,  videoBitrate: "600k"   },
];

/**
 * Menentukan daftar resolusi target berdasarkan aturan bisnis:
 *
 * - Jika resolusi asli < 720p  → render 1 resolusi saja (resolusi aslinya)
 * - Jika resolusi asli >= 720p → render resolusi asli + 2 resolusi standar di bawahnya
 *
 * Contoh:
 *   720p  → [720p, 480p, 360p]
 *   1080p → [1080p, 720p, 480p]
 *   1440p → [1440p, 1080p, 720p]
 *   4K    → [4k, 1440p, 1080p]
 */
export const getResolutionByRule = (originalHeight: number): VideoResolution[] => {
  // Untuk video di bawah 720p, tidak perlu dipotong
  if (originalHeight < 720) {
    return [{ name: `${originalHeight}p`, height: originalHeight, width: 0, videoBitrate: "600k" }];
  }

  // Temukan posisi resolusi standar yang paling dekat dengan resolusi asli
  // (cari resolusi standar yang <= originalHeight, ambil yang tertinggi)
  const closestIndex = STANDARD_RESOLUTIONS.findIndex(
    (res) => res.height <= originalHeight,
  );

  if (closestIndex === -1) {
    // Resolusi lebih rendah dari semua standar — fallback ke 360p
    return [STANDARD_RESOLUTIONS[STANDARD_RESOLUTIONS.length - 1]];
  }

  // Ambil resolusi asli (atau yang paling dekat) + 2 resolusi di bawahnya
  const targets = STANDARD_RESOLUTIONS.slice(closestIndex, closestIndex + 3);

  // Jika resolusi asli bukan resolusi standar yang tepat (misal: 900p),
  // ganti nama resolusi pertama dengan nama aslinya
  if (targets[0].height !== originalHeight) {
    targets[0] = {
      ...targets[0],
      name: `${originalHeight}p`,
      height: originalHeight,
    };
  }

  return targets;
};
