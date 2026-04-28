import { eq, sql } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { videos, videoAssets } from "../../../drizzle/schema";

export type CreateVideoData = {
  title: string;
  slug: string;
  sourcePath: string;
  originalName: string;
  status: "uploading" | "queued" | "processing" | "ready" | "failed";
};

export type CreateAssetData = {
  videoId: string;
  jobId?: string;
  codec: "h264" | "h265" | "hevc" | "vp9" | "av1" | "vp8";
  format: "mp4" | "webm";
  protocol: "hls" | "dash" | "plain";
  resolution: string;
  bitrateKbps?: number;
  storagePath?: string;
  cdnUrl?: string;
  manifestUrl?: string;
  fileSizeBytes?: number;
};

export const createVideo = async (data: CreateVideoData) => {
  const result = await db.insert(videos).values(data).returning();
  return result[0];
};

export const updateVideoStatus = async (id: string, status: CreateVideoData["status"]) => {
  await db.update(videos).set({ status, updatedAt: new Date() }).where(eq(videos.id, id));
};

export const updateVideoTotalJobs = async (id: string, totalJobs: number) => {
  await db.update(videos).set({ totalJobs, updatedAt: new Date() }).where(eq(videos.id, id));
};

export const updateThumbnailUrl = async (id: string, url: string) => {
  await db.update(videos).set({ thumbnailUrl: url, updatedAt: new Date() }).where(eq(videos.id, id));
};

export const updateVideoMetadata = async (id: string, durationSeconds: number, fileSizeBytes: number) => {
  await db.update(videos).set({ durationSeconds, fileSizeBytes, updatedAt: new Date() }).where(eq(videos.id, id));
};

export const incrementDoneJobs = async (id: string) => {
  const result = await db
    .update(videos)
    .set({ doneJobs: sql`${videos.doneJobs} + 1`, updatedAt: new Date() })
    .where(eq(videos.id, id))
    .returning({ doneJobs: videos.doneJobs, totalJobs: videos.totalJobs });
  return result[0];
};

// Gabungan untuk pembuatan Video Asset
export const createAsset = async (data: CreateAssetData) => {
  const result = await db.insert(videoAssets).values(data).returning();
  return result[0];
};
