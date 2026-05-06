import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const qualityPresets = pgTable("quality_presets", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => users.id),
  name: varchar("name", { length: 50 }).notNull(),
  codec: varchar("codec", { length: 50 }),
  format: varchar("format", { length: 50 }),
  resolution: varchar("resolution", { length: 20 }),
  bitrateKbps: integer("bitrate_kbps"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
