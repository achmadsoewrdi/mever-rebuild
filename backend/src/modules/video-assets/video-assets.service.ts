import { findAssetsByVideoId } from "./video-assets.repository";
import { VideoAssetResponse } from "./video-assets.types";

// ============================================
//  SERVICE: Video Assets
// ============================================

export const getAssets = async (videoId: string): Promise<VideoAssetResponse[]> => {
  const rawAssets = await findAssetsByVideoId(videoId);

  return rawAssets.map((asset) => ({
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
  }));
};
