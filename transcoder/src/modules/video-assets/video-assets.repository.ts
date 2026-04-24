import { postgresLoader } from "../../loaders/postgres";
import { videoAssets } from "../../../drizzle/schema";

export type CreateAssetData = {
  videoId: string;
  jobId: string;
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

class VideoAssetsRepository {
  public async createAsset(data: CreateAssetData) {
    const result = await postgresLoader.db
      .insert(videoAssets)
      .values({
        videoId: data.videoId,
        jobId: data.jobId,
        codec: data.codec,
        format: data.format,
        protocol: data.protocol,
        resolution: data.resolution,
        bitrateKbps: data.bitrateKbps,
        storagePath: data.storagePath,
        cdnUrl: data.cdnUrl,
        manifestUrl: data.manifestUrl,
        fileSizeBytes: data.fileSizeBytes,
      })
      .returning();

    return result[0];
  }
}

export const videoAssetsRepository = new VideoAssetsRepository();
