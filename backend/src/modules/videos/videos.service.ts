import { findAllVideos, findVideoById, createVideo, updateVideoStatus } from "./videos.repository";
import { redisCache, minioClient } from "../../loaders";
import { VideoFilterInput, RequestUploadInput } from "./videos.schema";
import { env } from "../../config/env";
import { generateSlug } from "../../utils/slug";

// ============================================
//  SERVICE: Videos
// ============================================

export const listVideos = async (filter: VideoFilterInput) => {
  const cacheKey = `cache:videos:${JSON.stringify(filter)}`;
  const cached = await redisCache.get(cacheKey);
  if (cached) {
    console.log("[CACHE HIT] Data video didapat dari Redis");
    return JSON.parse(cached);
  }
  console.log("[CACHE MISS] Query database...");
  const videos = await findAllVideos(filter);
  await redisCache.set(cacheKey, JSON.stringify(videos), "EX", 300);
  return videos;
};

export const getVideoById = async (id: string) => {
  const cacheKey = `cache:video:${id}`;
  const cached = await redisCache.get(cacheKey);
  if (cached) {
    console.log("[CACHE HIT] Detail video didapat dari Redis");
    return JSON.parse(cached);
  }
  console.log("[CACHE MISS] Ambil detail video dari DB...");
  const video = await findVideoById(id);
  if (!video) {
    throw new Error("VIDEO_NOT_FOUND");
  }
  await redisCache.set(cacheKey, JSON.stringify(video), "EX", 600);
  return video;
};

// Fungsi helper untuk menghapus cache list videos
const invalidateVideosCache = async () => {
  try {
    const keys = await redisCache.keys("cache:videos:*");
    if (keys.length > 0) {
      await redisCache.del(keys);
      console.log("[CACHE INVALIDATED] Berhasil menghapus cache list videos");
    }
  } catch (err) {
    console.error("Gagal menghapus cache:", err);
  }
};

export const requestUpload = async (userId: string, input: RequestUploadInput) => {
  const slug = generateSlug(input.title);
  const objectName = `raw/${userId}/${slug}.mp4`;

  const newVideo = await createVideo({
    uploadedBy: userId,
    title: input.title,
    description: input.description,
    slug,
    originalName: input.originalName,
    fileSizeBytes: input.fileSizeBytes, // Sekarang opsional
    sourcePath: objectName,
  });

  // Hapus cache list videos karena ada video baru
  await invalidateVideosCache();

  const presignedUrl = await minioClient.presignedPutObject(
    env.MINIO_BUCKET_SOURCE,
    objectName,
    3600,
  );

  return {
    video: newVideo,
    uploadUrl: presignedUrl, // bug fix: typo "upladUrl" → "uploadUrl"
  };
};

export const confirmUpload = async (videoId: string): Promise<void> => {
  await updateVideoStatus(videoId, "ready");
  
  // Hapus cache list videos dan cache detail video
  await invalidateVideosCache();
  await redisCache.del(`cache:video:${videoId}`);
};
