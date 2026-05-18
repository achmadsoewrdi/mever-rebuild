import { db } from "./src/loaders";
import { videos } from "./drizzle/schema";

async function run() {
  const result = await db.select().from(videos).limit(1);
  console.log(result);
  process.exit(0);
}

run();
