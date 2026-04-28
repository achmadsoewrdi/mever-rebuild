import { eq } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users } from "../../../drizzle/schema";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// ============================================
//  REPOSITORY: Auth
// ============================================

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
};

export const createUser = async (data: NewUser): Promise<User> => {
  const result = await db.insert(users).values(data).returning();
  return result[0];
};
