import client, { type ApiResponse } from "./client";

export interface DashboardStats {
  totalUsers: number;
  totalVideos: number;
  processingJobs: number;
  failedJobs: number;
  totalStorageBytes: number;
}

export interface RecentVideo {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  status: string;
  createdAt: string;
}

export interface RecentFailedJob {
  id: string;
  errorMessage?: string | null;
  completedAt?: string | null;
  videoTitle?: string | null;
  videoThumbnail?: string | null;
  presetName?: string | null;
  presetResolution?: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentVideos: RecentVideo[];
  recentFailedJobs: RecentFailedJob[];
}

export const dashboardApi = {
  get: async () => {
    const res = (await client.get("/admin/dashboard")) as ApiResponse<DashboardData>;
    return res.data as DashboardData;
  },
};
