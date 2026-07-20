import {
  findAllVideos,
  findVideoById,
  createVideo,
  updateVideoStatus,
} from "./videos.repository";
import { redisCache } from "../../loaders";
import { VideoFilterInput, RequestUploadInput } from "./videos.schema";
import { generateSlug } from "../../utils/slug";
import { getActiveConfigDecrypted } from "../storage-configs/storage-configs.service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const requestUpload = async (
  userId: string,
  input: RequestUploadInput,
) => {
  // Dapatkan konfigurasi storage yang aktif secara dinamis
  const config = await getActiveConfigDecrypted();

  const slug = generateSlug(input.title);
  const objectName = `raw/${userId}/${slug}.mp4`;

  const newVideo = await createVideo({
    uploadedBy: userId,
    storageConfigId: config.id, // Simpan referensi storage ke tabel video
    title: input.title,
    description: input.description,
    slug,
    originalName: input.originalName,
    fileSizeBytes: input.fileSizeBytes, // Sekarang opsional
    targetCodec: input.targetCodec as any,
    targetProtocol: input.targetProtocol as any,
    sourcePath: objectName,
  });

  // Hapus cache list videos karena ada video baru
  await invalidateVideosCache();

  // Inisialisasi S3 Client secara dinamis khusus untuk request ini
  let endpoint = config.endpointUrl!;
  if (!endpoint.startsWith("http")) {
    endpoint = `https://${endpoint}`; // Default protocol
  }

  const s3Client = new S3Client({
    region: "us-east-1", // Bisa diganti sesuai region bucket, default S3/MinIO us-east-1
    endpoint: endpoint,
    credentials: {
      accessKeyId: config.accessKey!,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: true, // Penting untuk MinIO
  });

  const command = new PutObjectCommand({
    Bucket: config.bucketInput!,
    Key: objectName,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return {
    video: newVideo,
    uploadUrl: presignedUrl,
  };
};

export const confirmUpload = async (videoId: string): Promise<void> => {
  const video = await findVideoById(videoId);
  if (!video) throw new Error("VIDEO_NOT_FOUND");
  if (video.status !== "uploading") {
    throw new Error("VIDEO_ALREADY_CONFIRMED");
  }

  await updateVideoStatus(videoId, "queued");

  // Hapus cache list videos dan cache detail video
  await invalidateVideosCache();
  await redisCache.del(`cache:video:${videoId}`);

  // Push ke antrean transcoder (berisi videoId)
  await redisCache.rpush("queue:upload", JSON.stringify({ videoId }));
};

export const getVideoStream = async (id: string) => {
  const cacheKey = `cache:video:stream:${id}`;
  const cached = await redisCache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const video = await findVideoById(id);
  if (!video) throw new Error("VIDEO_NOT_FOUND");

  if (video.status !== "ready") {
    throw new Error("VIDEO_NOT_READY");
  }

  if (!video.streamUrl) {
    throw new Error("VIDEO_STREAM_NOT_AVAILABLE");
  }

  const nginxBase = process.env.NGINX_VOD_URL || "http://localhost:8080";
  const result = {
    videoId: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl,
    hlsUrl: `${nginxBase}${video.streamUrl}`,
    dashUrl: `${nginxBase}${video.streamUrl.replace("/video/", "/video-dash/").replace("master.m3u8", "manifest.mpd")}`,
    status: video.status,
    durationSeconds: video.durationSeconds,
  };

  // cache 10 menit
  await redisCache.set(cacheKey, JSON.stringify(result), "EX", 600);
  return result;
};
