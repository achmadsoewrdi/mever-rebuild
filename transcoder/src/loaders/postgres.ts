import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env";
import postgres from "postgres";

// 1. Inisialisasi client dan db secara langsung di level modul
export const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient);

/**
 * 2. Fungsi murni untuk mengetes koneksi (dipanggil saat server baru nyala)
 */
export const connectPostgres = async (): Promise<void> => {
  try {
    await queryClient`SELECT 1`;
    console.log(
      "[POSTGRES SUKSES] Berhasil terhubung ke database via Drizzle",
    );
  } catch (err: any) {
    console.error(
      "[POSTGRES ERROR] Gagal terhubung ke database:",
      err.message,
    );
    throw err;
  }
};

/**
 * 3. Fungsi murni untuk menutup koneksi (berguna saat mematikan aplikasi dengan aman)
 */
export const disconnectPostgres = async (): Promise<void> => {
  await queryClient.end();
  console.log("[POSTGRES INFO] Koneksi database berhasil ditutup");
};
