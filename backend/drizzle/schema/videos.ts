import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { videoStatusEnum } from "./enums";

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  originalName: varchar("original_name", { length: 255 }),
  sourcePath: varchar("source_path", { length: 500 }),
  status: videoStatusEnum("status").default("uploading").notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  durationSeconds: integer("duration_seconds"),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  totalJobs: integer("total_jobs").default(0),
  doneJobs: integer("done_jobs").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
