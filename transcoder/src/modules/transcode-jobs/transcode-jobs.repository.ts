import { eq } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { transcodeJobs } from "../../../drizzle/schema";

export type CreateJobData = {
  videoId: string;
  outputFilename: string;
  codec: string;
  resolution: string;
  packager: string;
};

type JobStatus = "queued" | "processing" | "completed" | "failed";

export const createManyJobs = async (jobs: CreateJobData[]) => {
  return await db.insert(transcodeJobs).values(jobs).returning();
};

export const updateJobStatus = async (id: string, status: JobStatus, workerId?: string) => {
  const updateData: any = { status };
  if (status === "processing") updateData.startedAt = new Date();
  if (workerId) updateData.workerId = workerId;

  await db.update(transcodeJobs).set(updateData).where(eq(transcodeJobs.id, id));
};

export const updateJobProgress = async (id: string, progressPct: number) => {
  await db.update(transcodeJobs).set({ progressPct }).where(eq(transcodeJobs.id, id));
};

export const setJobCompleted = async (id: string, assetId: string) => {
  await db.update(transcodeJobs).set({
    status: "completed",
    progressPct: 100,
    assetId: assetId,
    completedAt: new Date(),
  }).where(eq(transcodeJobs.id, id));
};

export const setJobFailed = async (id: string, errorMessage: string) => {
  await db.update(transcodeJobs).set({
    status: "failed",
    errorMessage,
    completedAt: new Date(),
  }).where(eq(transcodeJobs.id, id));
};
