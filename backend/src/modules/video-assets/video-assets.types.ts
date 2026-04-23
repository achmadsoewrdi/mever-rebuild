export interface VideoAssetResponse {
  id: string;
  videoId: string;
  codec: string;
  format: string;
  protocol: string;
  resolution: string;
  bitrateKbps: number | null;
  cdnUrl: string | null;
  manifestUrl: string | null;
  fileSizeBytes: number | null;
  createdAt: Date;
}
