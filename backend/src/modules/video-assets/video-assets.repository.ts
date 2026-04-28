import { eq } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { videoAssets } from "../../../drizzle/schema";

type VideoAsset = typeof videoAssets.$inferSelect;

// ============================================
//  REPOSITORY: Video Assets
// ============================================

export const findAssetsByVideoId = async (videoId: string): Promise<VideoAsset[]> => {
  return db
    .select()
    .from(videoAssets)
    .where(eq(videoAssets.videoId, videoId));
};
