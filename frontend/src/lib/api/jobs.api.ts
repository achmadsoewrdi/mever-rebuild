import client, { type ApiResponse } from "./client";

export interface JobVideo {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export interface JobPreset {
  format?: string;
  resolution?: string;
  name?: string;
}

export interface JobItem {
  id: string;
  status: "queued" | "processing" | "ready" | "failed";
  progressPct: number;
  errorMessage?: string;
  outputFilename?: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  video: JobVideo;
  preset: JobPreset;
}

export interface JobStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface JobsResponse {
  stats: JobStats;
  jobs: JobItem[];
  total: number;
}

export const jobsApi = {
  getJobs: async (params?: { page?: number; limit?: number }) => {
    const res = (await client.get("/admin/jobs", { params })) as ApiResponse<JobsResponse>;
    return res.data as JobsResponse;
  },

  retryJob: async (id: string) => {
    const res = (await client.post(`/admin/jobs/${id}/retry`)) as ApiResponse;
    return res.data;
  },
};
