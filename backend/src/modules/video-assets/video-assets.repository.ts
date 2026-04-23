import { eq } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { videoAssets } from "../../../drizzle/schema";

class VideoAssetsRepository {
  async findByVideoId(videoId: string) {
    const assets = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.videoId, videoId));

    return assets;
  }
}

export const videoAssetsRepository = new VideoAssetsRepository();
