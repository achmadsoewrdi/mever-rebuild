import { db } from "./src/loaders";
import { videos, videoAssets } from "./drizzle/schema";
import { sum } from "drizzle-orm";

async function run() {
  const [totalVideosRaw] = await db.select({ sum: sum(videos.fileSizeBytes) }).from(videos);
  console.log("Raw storage sum:", totalVideosRaw);

  const [totalAssets] = await db.select({ sum: sum(videoAssets.fileSizeBytes) }).from(videoAssets);
  console.log("Assets storage sum:", totalAssets);
  
  process.exit(0);
}

run();
