import { eq, sql } from "drizzle-orm";
import { postgresLoader } from "../../loaders/postgres";
import { videos } from "../../../drizzle/schema";

export type CreateVideoData = {
  title: string;
  slug: string;
  sourcePath: string;
  originalName: string;
  status: "uploading" | "queued" | "processing" | "ready" | "failed";
};

class VideoRepository {
  public async createVideo(data: CreateVideoData) {
    const result = await postgresLoader.db
      .insert(videos)
      .values({
        title: data.title,
        slug: data.slug,
        sourcePath: data.sourcePath,
        originalName: data.originalName,
        status: data.status,
      })
      .returning();

    return result[0];
  }

  public async updateVideoStatus(
    id: string,
    status: "uploading" | "queued" | "processing" | "ready" | "failed",
  ) {
    await postgresLoader.db
      .update(videos)
      .set({ status, updatedAt: new Date() })
      .where(eq(videos.id, id));
  }

  public async updateVideoTotalJobs(id: string, totalJobs: number) {
    await postgresLoader.db
      .update(videos)
      .set({ totalJobs, updatedAt: new Date() })
      .where(eq(videos.id, id));
  }

  public async updateThumbnailUrl(id: string, url: string) {
    await postgresLoader.db
      .update(videos)
      .set({ thumbnailUrl: url, updatedAt: new Date() })
      .where(eq(videos.id, id));
  }

  public async incrementDoneJobs(id: string) {
    const result = await postgresLoader.db
      .update(videos)
      .set({ doneJobs: sql`${videos.doneJobs} + 1`, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning({ doneJobs: videos.doneJobs, totalJobs: videos.totalJobs });

    return result[0];
  }
}

export const videoRepository = new VideoRepository();
