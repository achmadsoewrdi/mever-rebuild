import { eq } from "drizzle-orm";
import { postgresLoader } from "../../loaders/postgres";
import { transcodeJobs } from "../../../drizzle/schema";

export type CreateJobData = {
  videoId: string;
  outputFilename: string;
  codec: string;
  resolution: string;
  packager: string;
};

type JobStatus = "queued" | "processing" | "completed" | "failed";

class TranscodeJobsRepository {
  public async createManyJobs(jobs: CreateJobData[]) {
    const result = await postgresLoader.db
      .insert(transcodeJobs)
      .values(jobs)
      .returning();
    return result;
  }

  public async updateJobStatus(
    id: string,
    status: JobStatus,
    workerId?: string,
  ) {
    const updateData: any = { status };

    if (status === "processing") {
      updateData.startedAt = new Date();
    }

    if (workerId) {
      updateData.workerId = workerId;
    }

    await postgresLoader.db
      .update(transcodeJobs)
      .set(updateData)
      .where(eq(transcodeJobs.id, id));
  }

  public async updateJobProgress(id: string, progressPct: number) {
    await postgresLoader.db
      .update(transcodeJobs)
      .set({ progressPct })
      .where(eq(transcodeJobs.id, id));
  }

  public async setJobCompleted(id: string, assetId: string) {
    await postgresLoader.db
      .update(transcodeJobs)
      .set({
        status: "completed",
        progressPct: 100,
        assetId: assetId,
        completedAt: new Date(),
      })
      .where(eq(transcodeJobs.id, id));
  }

  public async setJobFailed(id: string, errorMessage: string) {
    await postgresLoader.db
      .update(transcodeJobs)
      .set({
        status: "failed",
        errorMessage: errorMessage,
        completedAt: new Date(),
      })
      .where(eq(transcodeJobs.id, id));
  }
}

export const transcodeJobsRepository = new TranscodeJobsRepository();
