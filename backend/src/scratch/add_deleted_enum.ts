import { db } from "../loaders/postgres";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Updating enum video_status...");
    await db.execute(sql`ALTER TYPE video_status ADD VALUE 'deleted'`);
    console.log("Enum updated successfully!");
    process.exit(0);
  } catch (err: any) {
    if (err.message && err.message.includes("already exists")) {
      console.log("Enum value 'deleted' already exists.");
      process.exit(0);
    }
    console.error("Error updating enum:", err);
    process.exit(1);
  }
}

main();
