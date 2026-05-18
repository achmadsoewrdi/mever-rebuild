import { db } from "../../../loaders";
import { users, videos, transcodeJobs, qualityPresets } from "../../../../drizzle/schema";
import { sql, eq, desc, sum } from "drizzle-orm";
import { count } from "drizzle-orm";

export const getDashboardStats = async () => {
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalVideos] = await db.select({ count: count() }).from(videos);

  const jobStatusCounts = await db
    .select({ status: transcodeJobs.status, count: count() })
    .from(transcodeJobs)
    .groupBy(transcodeJobs.status);

  let processingJobs = 0;
  let failedJobs = 0;
  jobStatusCounts.forEach((r) => {
    if (r.status === "processing" || r.status === "queued") {
      processingJobs += Number(r.count);
    }
    if (r.status === "failed") {
      failedJobs += Number(r.count);
    }
  });

  const [totalStorage] = await db.select({ sum: sum(videos.fileSizeBytes) }).from(videos);

  return {
    totalUsers: Number(totalUsers.count),
    totalVideos: Number(totalVideos.count),
    processingJobs,
    failedJobs,
    totalStorageBytes: Number(totalStorage.sum || 0),
  };
};

export const getRecentVideos = async (limit: number = 5) => {
  return db
    .select({
      id: videos.id,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      status: videos.status,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .orderBy(desc(videos.createdAt))
    .limit(limit);
};

export const getRecentFailedJobs = async (limit: number = 5) => {
  return db
    .select({
      id: transcodeJobs.id,
      errorMessage: transcodeJobs.errorMessage,
      completedAt: transcodeJobs.completedAt,
      videoTitle: videos.title,
      videoThumbnail: videos.thumbnailUrl,
      presetName: qualityPresets.name,
      presetResolution: qualityPresets.resolution,
    })
    .from(transcodeJobs)
    .leftJoin(videos, eq(transcodeJobs.videoId, videos.id))
    .leftJoin(qualityPresets, eq(transcodeJobs.presetId, qualityPresets.id))
    .where(eq(transcodeJobs.status, "failed"))
    .orderBy(desc(transcodeJobs.queuedAt))
    .limit(limit);
};
