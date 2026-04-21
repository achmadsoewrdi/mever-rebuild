import { eq, ilike, and, desc } from "drizzle-orm";
import { db } from "../../loaders";
import { videos } from "../../../drizzle/schema";
import { VideoFilterInput } from "./videos.schema";

type Video = typeof videos.$inferSelect;

class VideoRepository {
  // get all videos
  async findAll(filter: VideoFilterInput): Promise<Video[]> {
    const { status, search, limit = 10, page = 1 } = filter;
    const whereConditions = [];

    if (status) {
      whereConditions.push(eq(videos.status, status));
    }
    if (search) {
      whereConditions.push(ilike(videos.title, `%${search}%`));
    }
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(videos)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  //   find by id

  async findById(id: string): Promise<Video | undefined> {
    const result = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id))
      .limit(1);
    return result[0];
  }

  //   find by slug

  async findBySlug(slug: string): Promise<Video | undefined> {
    const result = await db
      .select()
      .from(videos)
      .where(eq(videos.slug, slug))
      .limit(1);
    return result[0];
  }
}

export const videosRepository = new VideoRepository();
