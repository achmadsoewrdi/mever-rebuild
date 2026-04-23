import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { videos } from "./videos";
import { jobStatusEnum } from "./enums";

export const transcodeJobs = pgTable("transcode_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id),
  assetId: uuid("asset_id"),
  redisJobId: varchar("redis_job_id", { length: 255 }),
  workerId: varchar("worker_id", { length: 100 }),
  outputFilename: varchar("output_filename", { length: 255 }),
  codec: varchar("codec", { length: 20 }),
  resolution: varchar("resolution", { length: 20 }),
  packager: varchar("packager", { length: 20 }),
  status: jobStatusEnum("status").default("queued").notNull(),
  progressPct: integer("progress_pct").default(0),
  errorMessage: text("error_message"),
  queuedAt: timestamp("queued_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});
