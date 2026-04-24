import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { env } from "../config/env";
import postgres from "postgres";

class PostgresLoader {
  public client: postgres.Sql;
  public db: PostgresJsDatabase;

  constructor() {
    this.client = postgres(env.DATABASE_URL);
    this.db = drizzle(this.client);
  }

  //method
  public async connect(): Promise<void> {
    try {
      await this.client`SELECT 1`;
      console.log(
        "[POSTGRES SUKSES] Behasil terhubung ke database vida Drizzle",
      );
    } catch (err: any) {
      console.error(
        "[POSTGRES ERROR] Gagal terhubung ke database:",
        err.message,
      );
      throw err;
    }
  }

  public async disconected(): Promise<void> {
    await this.client.end();
    console.log("[POSTGRES INFO] Koneksi database berhasil di tutup");
  }
}

export const postgresLoader = new PostgresLoader();
