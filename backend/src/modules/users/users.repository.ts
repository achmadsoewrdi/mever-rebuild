import { eq } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users } from "../../../drizzle/schema/users";

/**
 * Repository Users
 */

/**
 * findByid (id)
 * mengambil data pengguna berdasarkan id
 */

export const findById = async (id: string) => {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      mfaEnabled: users.mfaEnabled,
      mfaMethod: users.mfaMethod,
      mfaVerifiedAt: users.mfaVerifiedAt,
      createdAt: users.createdAt,
      updateAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0];
};

/**
 * Find User with password
 */
export const findWithPassword = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
};

/**
 * update profile
 */
export const updateProfile = async (
  id: string,
  data: { name?: string; email?: string },
) => {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
};

/**
 * update password
 */

export const updatePassword = async (id: string, hashedPassword: string) => {
  await db
    .update(users)
    .set({ passwordHash: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, id));
};
