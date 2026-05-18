import * as repo from "./jobs.repository";
import { Queue } from "bullmq";
import { redisCache } from "../../../loaders";
import { env } from "../../../config/env";

let transcodeQueue: Queue | null = null;

const getTranscodeQueue = () => {
  if (!transcodeQueue) {
    transcodeQueue = new Queue("transcodeQueue", {
      connection: redisCache,
    });
  }
  return transcodeQueue;
};

const parseResolutionHeight = (resString: string | null) => {
  if (!resString) return 0;
  const lower = resString.toLowerCase();
  if (lower === "4k") return 2160;
  if (lower === "2k") return 1440;
  return parseInt(lower.replace(/\D/g, ""), 10) || 0;
};

export const getQueueStatus = async (limit: number = 10, offset: number = 0) => {
  const stats = await repo.getJobStats();
  const list = await repo.getJobsList(limit, offset);
  
  return {
    stats,
    jobs: list.data,
    total: list.total,
  };
};

export const retryJob = async (jobId: string) => {
  const jobDetails = await repo.getJobById(jobId);
  if (!jobDetails || !jobDetails.job) {
    throw new Error("Job not found");
  }

  const { job, video, preset } = jobDetails;

  if (job.status !== "failed") {
    throw new Error("Hanya job yang gagal yang dapat di-retry");
  }

  // Update DB status to queued
  await repo.updateJobStatus(jobId, "queued");

  const packagerFormat = preset?.format?.toLowerCase() || "";
  const packager = packagerFormat.includes("hls")
    ? "hls"
    : packagerFormat.includes("dash")
      ? "dash"
      : "plain";
      
  const resolutionHeight = parseResolutionHeight(preset?.resolution || "");

  const jobMessage = {
    jobId: job.id,
    totalJobs: video?.totalJobs || 1,
    videoId: video?.id,
    storageConfigId: video?.storageConfigId,
    presetId: preset?.id,
    sourcePath: video?.sourcePath,
    localSourcePath: "", // Kosongkan agar diunduh ulang oleh transcoder
    outputFilename: job.outputFilename,
    codec: preset?.codec || "h264",
    resolutionName: preset?.name || "unknown",
    resolutionHeight,
    packager,
    slug: video?.slug,
  };

  const queue = getTranscodeQueue();
  await queue.add("render", jobMessage, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
  });

  return { message: "Job berhasil dimasukkan kembali ke antrian", jobId };
};
