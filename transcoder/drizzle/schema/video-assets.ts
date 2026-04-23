import {
  pgTable,
  uuid,
  varchar,
  integer,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { videos } from "./videos";
import { codecTypeEnum, formatTypeEnum, protocolTypeEnum } from "./enums";

export const videoAssets = pgTable("video_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id),
  jobId: uuid("job_id"),
  codec: codecTypeEnum("codec").notNull(),
  format: formatTypeEnum("format").notNull(),
  protocol: protocolTypeEnum("protocol").notNull(),
  resolution: varchar("resolution", { length: 20 }).notNull(),
  bitrateKbps: integer("bitrate_kbps"),
  storagePath: varchar("storage_path", { length: 500 }),
  cdnUrl: varchar("cdn_url", { length: 500 }),
  manifestUrl: varchar("manifest_url", { length: 500 }),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
