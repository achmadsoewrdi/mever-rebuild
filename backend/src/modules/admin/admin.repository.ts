import { eq } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users } from "../../../drizzle/schema";

/**
 * =====================
 * Repository Admin
 * =====================
 */

// mengambil semua user dari database
export const getAllUser = async () => {
  const result = await db.select().from(users);
  return result.map(({ passwordHash, ...user }) => user);
};

// mengambil role user (admin / user)
export const changeUserRole = async (
  userId: string,
  newRole: "admin" | "user",
) => {
  const result = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId))
    .returning();
  return result[0];
};

// mengaktifkan atau nonaktifkan user
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const result = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, userId))
    .returning();
  return result[0];
};
