import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { userRoleEnum, mfaMethodEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // MFA — hanya untuk admin
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  mfaMethod: mfaMethodEnum("mfa_method"),
  mfaSecretEnc: varchar("mfa_secret_enc", { length: 512 }),
  mfaBackupCodes: varchar("mfa_backup_codes", { length: 2048 }),
  mfaVerifiedAt: timestamp("mfa_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
