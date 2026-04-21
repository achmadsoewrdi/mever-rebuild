import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";

const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
});

export const db = drizzle(queryClient);

export const connectToPostgres = async () => {
  try {
    await queryClient`SELECT 1`;
    console.log("Berhasil terhubung ke postgres via drizzle");
  } catch (e) {
    console.error("Gagal terhubung ke database:", e);
    process.exit(1);
  }
};
