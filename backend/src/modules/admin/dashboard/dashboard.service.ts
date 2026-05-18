import * as repo from "./dashboard.repository";

export const getDashboardData = async () => {
  const [stats, recentVideos, recentFailedJobs] = await Promise.all([
    repo.getDashboardStats(),
    repo.getRecentVideos(5),
    repo.getRecentFailedJobs(5),
  ]);

  return { stats, recentVideos, recentFailedJobs };
};
