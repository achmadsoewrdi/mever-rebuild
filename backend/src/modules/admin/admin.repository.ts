import { eq, and, ilike, sql } from "drizzle-orm";
import { db } from "../../loaders/postgres";
import { users, videos, videoAssets, transcodeJobs, accountRequests } from "../../../drizzle/schema";

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

export const deleteUser = async (userId: string) => {
  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  return result[0];
};

export const updateUserBasicInfo = async (
  userId: string,
  data: { name: string; email: string }
) => {
  const result = await db
    .update(users)
    .set({ name: data.name, email: data.email, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return result[0];
};

export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
}) => {
  const result = await db.insert(users).values(data).returning();
  return result[0];
};

/**
 * mengambil semua videi dengan pagination dan filter
 */

export const findAllVideos = async (
  limit: number,
  offser: number,
  search?: string,
  status?: string,
) => {
  const condition = [];

  if (search) {
    condition.push(ilike(videos.title, `%${search}%`));
  }
  if (status) {
    condition.push(eq(videos.status, status as any));
  }

  const wherClause = condition.length > 0 ? and(...condition) : undefined;

  const data = await db
    .select()
    .from(videos)
    .where(wherClause)
    .limit(limit)
    .offset(offser)
    .orderBy(sql`${videos.createdAt} DESC`);

  const total = await db
    .select({ count: sql`count(*)` })
    .from(videos)
    .where(wherClause);

  return { data, total: Number(total[0].count) };
};

/**
 * mengambil detail video berdasarkan id
 */

export const findVideoById = async (id: string) => {
  const result = await db.select().from(videos).where(eq(videos.id, id));
  return result[0];
};

/**
 * mengubah data video (tittle, description, status, dll)
 */

export const updateVideo = async (
  id: string,
  data: Partial<typeof videos.$inferInsert>,
) => {
  const result = await db
    .update(videos)
    .set(data)
    .where(eq(videos.id, id))
    .returning();
  return result[0];
};

/**
 * soft delete video
 */

export const softDeleteVideo = async (id: string) => {
  const result = await db
    .update(videos)
    .set({ status: "deleted" as any })
    .where(eq(videos.id, id))
    .returning();
  return result[0];
};

/**
 * Hard delete video dari database
 */
export const hardDeleteVideo = async (id: string) => {
  // Hapus semua jobs terkait terlebih dahulu untuk menghindari constraint error
  await db.delete(transcodeJobs).where(eq(transcodeJobs.videoId, id));
  
  // Hapus semua asset terkait (resolusi)
  await db.delete(videoAssets).where(eq(videoAssets.videoId, id));

  // Terakhir, hapus data utama dari tabel video
  const result = await db
    .delete(videos)
    .where(eq(videos.id, id))
    .returning();
  return result[0];
};

/**
 * =====================
 * Account Requests
 * =====================
 */

export const getAccountRequests = async (status?: string) => {
  const whereClause = status ? eq(accountRequests.status, status as any) : undefined;
  const result = await db
    .select()
    .from(accountRequests)
    .where(whereClause)
    .orderBy(sql`${accountRequests.createdAt} DESC`);
  return result;
};

export const getAccountRequestById = async (id: string) => {
  const result = await db
    .select()
    .from(accountRequests)
    .where(eq(accountRequests.id, id));
  return result[0];
};

export const updateAccountRequestStatus = async (id: string, status: "approved" | "rejected") => {
  const result = await db
    .update(accountRequests)
    .set({ status })
    .where(eq(accountRequests.id, id))
    .returning();
  return result[0];
};
