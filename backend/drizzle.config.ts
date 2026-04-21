import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

console.log("DATABASE_URL:", process.env.DATABASE_URL); // debug sementara

export default defineConfig({
  schema: "./drizzle/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
