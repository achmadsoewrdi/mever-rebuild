import { eq, ilike, and, desc, inArray, exists } from "drizzle-orm";
import { db } from "../../loaders";
import { videos, videoAssets } from "../../../drizzle/schema";
import { VideoFilterInput } from "./videos.schema";

type Video = typeof videos.$inferSelect;

// ============================================
//  REPOSITORY: Videos
// ============================================

export const findAllVideos = async (filter: VideoFilterInput): Promise<Video[]> => {
  console.log("--------------------------------------------------");
  console.log("[BACKEND REPO] Memproses filter:", JSON.stringify(filter));
  console.log("[BACKEND REPO] CWD:", process.cwd());
  
  const { status, search, protocols, encoders, resolutions, limit = 10, page = 1 } = filter;
  const whereConditions = [];

  if (status) {
    whereConditions.push(eq(videos.status, status));
  }
  if (search) {
    whereConditions.push(ilike(videos.title, `%${search}%`));
  }

  // Filter Protocols (targetProtocol)
  if (protocols && protocols.length > 0) {
    console.log("[REPO] Menambah filter protocols:", protocols);
    whereConditions.push(inArray(videos.targetProtocol, protocols as any));
  }

  // Filter Encoders (targetCodec)
  if (encoders && encoders.length > 0) {
    console.log("[REPO] Menambah filter encoders:", encoders);
    whereConditions.push(inArray(videos.targetCodec, encoders as any));
  }

  // Filter Resolutions (Join dengan video_assets)
  if (resolutions && resolutions.length > 0) {
    console.log("[REPO] Menambah filter resolutions:", resolutions);
    const subquery = db
      .select({ id: videoAssets.videoId })
      .from(videoAssets)
      .where(
        and(
          eq(videoAssets.videoId, videos.id),
          inArray(videoAssets.resolution, resolutions),
        ),
      );
    whereConditions.push(exists(subquery));
  }

  const offset = (page - 1) * limit;
  console.log("[REPO] Total kondisi WHERE:", whereConditions.length);
  
  return db
    .select()
    .from(videos)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);
};

export const findVideoById = async (id: string): Promise<Video | undefined> => {
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result[0];
};

export const findVideoBySlug = async (slug: string): Promise<Video | undefined> => {
  const result = await db.select().from(videos).where(eq(videos.slug, slug)).limit(1);
  return result[0];
};

export const createVideo = async (data: typeof videos.$inferInsert): Promise<Video> => {
  const result = await db.insert(videos).values(data).returning();
  return result[0];
};

export const updateVideoStatus = async (
  id: string,
  status: "uploading" | "queued" | "processing" | "ready" | "failed",
): Promise<void> => {
  await db
    .update(videos)
    .set({ status, updatedAt: new Date() })
    .where(eq(videos.id, id));
};
