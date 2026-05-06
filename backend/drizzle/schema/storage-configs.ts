import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const storageConfigs = pgTable("storage_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => users.id),
  name: varchar("name", { length: 100 }),
  endpointUrl: varchar("endpoint_url", { length: 255 }),
  bucketInput: varchar("bucket_input", { length: 255 }),
  bucketOutput: varchar("bucket_output", { length: 255 }),
  accessKey: varchar("access_key", { length: 255 }),
  secretKeyEnc: varchar("secret_key_enc", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
