import { PgTable, varchar, timestamp, uuid, pgTable } from "drizzle-orm/pg-core";

export const accountRequests = pgTable('account_requests',{
    id: uuid('id').primaryKey().defaultRandom(),
    name:varchar('name', {length:255}).notNull(),
    email: varchar('email',{length:255}).notNull().unique(),
    department: varchar('department', {length:255}).notNull(),
    status: varchar('status', {length:20}).default('pending'),
    // pending, rejected, approved
    createdAt: timestamp('created_at').defaultNow(),
})