import { eq, ilike, and, desc, inArray, exists, ne } from "drizzle-orm";
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
  } else {
    // Sembunyikan video yang gagal (error) dari daftar utama
    whereConditions.push(ne(videos.status, "failed"));
  }
  if (search) {
    whereConditions.push(ilike(videos.title, `%${search}%`));
  }

  // Filter Protocols (Join dengan video_assets agar sinkron dengan UI Tags)
  if (protocols && protocols.length > 0) {
    console.log("[REPO] Menambah filter protocols:", protocols);
    const subquery = db
      .select({ id: videoAssets.videoId })
      .from(videoAssets)
      .where(
        and(
          eq(videoAssets.videoId, videos.id),
          inArray(videoAssets.protocol, protocols as any),
        ),
      );
    whereConditions.push(exists(subquery));
  }

  // Filter Encoders (Join dengan video_assets agar sinkron dengan UI Tags)
  if (encoders && encoders.length > 0) {
    console.log("[REPO] Menambah filter encoders:", encoders);
    const subquery = db
      .select({ id: videoAssets.videoId })
      .from(videoAssets)
      .where(
        and(
          eq(videoAssets.videoId, videos.id),
          inArray(videoAssets.codec, encoders as any),
        ),
      );
    whereConditions.push(exists(subquery));
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
  
  const query = db
    .select()
    .from(videos)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);

  console.log("[REPO] SQL Query:", query.toSQL().sql);
  console.log("[REPO] SQL Params:", query.toSQL().params);

  return query;
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
