import { eq } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users } from "../../../drizzle/schema";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// ============================================
//  REPOSITORY: Auth
// ============================================

export const findUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
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

/**
 * FIND USER BY ID
 */

export const findUserById = async (id: string): Promise<User | undefined> => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
};

/**
 * UPDATE MFA SECRET
 */

export const updateMfaSecret = async (
  userId: string,
  secret: string,
): Promise<void> => {
  await db
    .update(users)
    .set({ mfaSecretEnc: secret })
    .where(eq(users.id, userId));
};

/**
 * ENABLE MFA
 */
export const enableMfa = async (id: string): Promise<void> => {
  await db
    .update(users)
    .set({ mfaEnabled: true, mfaVerifiedAt: new Date() })
    .where(eq(users.id, id));
};
