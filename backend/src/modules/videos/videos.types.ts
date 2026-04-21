// ================================
// VIDEO FILTER
// ================================

export interface VideoFilter {
  status?: "uploading" | "queued" | "processing" | "ready" | "failed";
  page?: number;
  limit?: number;
  search?: string;
}

// ================================
// VIDEO RESPONSE
// ================================

export interface VideoResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "uploading" | "queued" | "processing" | "ready" | "failed";
  thumbnaiUrl: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  publishedAt: Date | null;
  createdAt: Date;
}
