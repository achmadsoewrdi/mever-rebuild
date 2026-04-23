// transcoder/src/server.ts

import { env } from "./config/env";
import { redisLoader } from "./loaders/redis";

const startServer = async () => {
  console.log("✅ Validasi Environment BERHASIL!");
  console.log("🎥 Transcoder siap dijalankan dengan ID:", env.WORKER_ID);

  try {
    // Kita panggil secara eksplisit untuk mengetes koneksi (Nge-Ping)
    const balasan = await redisLoader.main.ping();
    console.log("🏓 Tes Ping ke Redis membalas:", balasan); // Harusnya mencetak "PONG"
  } catch (error) {
    console.error("🔴 Gagal melakukan ping ke Redis:", error);
  }
};

startServer();
