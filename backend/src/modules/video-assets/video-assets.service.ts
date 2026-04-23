import { videoAssetsRepository } from "./video-assets.repository";
import { VideoAssetResponse } from "./video-assets.types";

class VideoAssetsService {
  async getAssets(videoId: string): Promise<VideoAssetResponse[]> {
    // Memanggil method dari instance repository
    const rawAssets = await videoAssetsRepository.findByVideoId(videoId);

    const formattedAssets: VideoAssetResponse[] = rawAssets.map((asset) => {
      return {
        id: asset.id,
        videoId: asset.videoId,
        codec: asset.codec,
        format: asset.format,
        protocol: asset.protocol,
        resolution: asset.resolution,
        bitrateKbps: asset.bitrateKbps,
        cdnUrl: asset.cdnUrl,
        manifestUrl: asset.manifestUrl,
        fileSizeBytes: asset.fileSizeBytes,
        createdAt: asset.createdAt,
      };
    });

    return formattedAssets;
  }
}

// Export instance dari class-nya
export const videoAssetsService = new VideoAssetsService();
