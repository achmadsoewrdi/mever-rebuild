import { eq, desc, sql, count } from "drizzle-orm";
import { db } from "../../../loaders";
import { transcodeJobs, videos, qualityPresets } from "../../../../drizzle/schema";

export const getJobStats = async () => {
  const result = await db
    .select({
      status: transcodeJobs.status,
      count: count(transcodeJobs.id),
    })
    .from(transcodeJobs)
    .groupBy(transcodeJobs.status);

  let total = 0;
  const stats = {
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  result.forEach((row) => {
    total += Number(row.count);
    if (stats.hasOwnProperty(row.status)) {
      (stats as any)[row.status] = Number(row.count);
    }
  });

  return { total, ...stats };
};

export const getJobsList = async (limit: number, offset: number) => {
  const data = await db
    .select({
      id: transcodeJobs.id,
      status: transcodeJobs.status,
      progressPct: transcodeJobs.progressPct,
      errorMessage: transcodeJobs.errorMessage,
      outputFilename: transcodeJobs.outputFilename,
      queuedAt: transcodeJobs.queuedAt,
      startedAt: transcodeJobs.startedAt,
      completedAt: transcodeJobs.completedAt,
      video: {
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
      },
      preset: {
        format: qualityPresets.format,
        resolution: qualityPresets.resolution,
        name: qualityPresets.name,
      },
    })
    .from(transcodeJobs)
    .leftJoin(videos, eq(transcodeJobs.videoId, videos.id))
    .leftJoin(qualityPresets, eq(transcodeJobs.presetId, qualityPresets.id))
    .orderBy(desc(transcodeJobs.queuedAt), desc(transcodeJobs.id))
    .limit(limit)
    .offset(offset);

  const total = await db.select({ count: count() }).from(transcodeJobs);

  return {
    data,
    total: Number(total[0].count),
  };
};

export const getJobById = async (jobId: string) => {
  const result = await db
    .select({
      job: transcodeJobs,
      video: videos,
      preset: qualityPresets,
    })
    .from(transcodeJobs)
    .leftJoin(videos, eq(transcodeJobs.videoId, videos.id))
    .leftJoin(qualityPresets, eq(transcodeJobs.presetId, qualityPresets.id))
    .where(eq(transcodeJobs.id, jobId))
    .limit(1);

  return result[0];
};

export const updateJobStatus = async (jobId: string, status: any) => {
  await db.update(transcodeJobs).set({ status, errorMessage: null }).where(eq(transcodeJobs.id, jobId));
};
