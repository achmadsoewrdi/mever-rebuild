import { eq, and } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users } from "../../../drizzle/schema";
import { accountRequests } from "../../../drizzle/schema/account-requests";
import { RequestsAccountInput } from "./auth.schema";

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

/**
 * CHECK EMAIL REQUEST ACCOUNT
 */

export const checkExistingEmail = async (email:string):Promise<boolean> => {
  const [existingUser] = await db.select({id: users.id}).from(users).where(eq(users.email, email)).limit(1);

  return !!existingUser;
}

export const checkExistingPendingRequest = async (email: string): Promise<boolean> => {
  const [pendingRequest] = await db
    .select({ id: accountRequests.id })
    .from(accountRequests)
    .where(
      and(
        eq(accountRequests.email, email),
        eq(accountRequests.status, "pending")
      )
    )
    .limit(1);
  return !!pendingRequest;
};


export const createAccountRequest = async (data: RequestsAccountInput) => {
  try {
    const [newRequest] = await db
      .insert(accountRequests)
      .values({
        name: data.name,
        email: data.email,
        department: data.department,
        status: "pending", 
      })
      .returning(); 
    return newRequest;
  } catch (error: any) {
    // 23505 adalah kode error PostgreSQL untuk unique constraint violation
    // Drizzle mungkin membungkusnya di dalam error.cause
    if (error.code === "23505" || error.cause?.code === "23505") {
      throw new Error("Email ini sudah mengajukan request sebelumnya.");
    }
    // Lempar error lain jika bukan karena duplikat
    throw error;
  }
};