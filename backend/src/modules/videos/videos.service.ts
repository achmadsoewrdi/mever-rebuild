import { videosRepository } from "./videos.repository";
import { redisCache } from "../../loaders";
import { VideoFilterInput } from "./videos.schema";

class VideoService {
  // list video
  async listVideos(filter: VideoFilterInput) {
    const cacheKey = `cache:videos:${JSON.stringify(filter)}`;
    const cachedData = await redisCache.get(cacheKey);
    if (cachedData) {
      console.log("[CACHE HIT] Data Video didapat dari Redis");
      return JSON.parse(cachedData);
    }
    console.log("[CACHE MISS] Data Kosong Query database...");
    const videos = await videosRepository.findAll(filter);
    await redisCache.set(cacheKey, JSON.stringify(videos), "EX", 300);
    return videos;
  }

  //   get Video By ID
  async getVideoById(id: string) {
    const cacheKey = `cache:video:${id}`;
    const cachedData = await redisCache.get(cacheKey);
    if (cachedData) {
      console.log("[CACHE HITT] Detail Video didapat dari redis!");
      return JSON.parse(cachedData);
    }
    console.log("[CACHE MISS] Ambil detail video di DB...");
    const video = await videosRepository.findById(id);
    if (!video) {
      throw new Error("VIDEO_NOT_FOUND");
    }
    await redisCache.set(cacheKey, JSON.stringify(video), "EX", 600);
    return video;
  }
}

export const videoService = new VideoService();
