import * as repo from "./admin.repository";
import { hashPassword } from "../../utils/hash";
import { redisCache } from "../../loaders";

export const getAllUsers = async () => {
  return await repo.getAllUser();
};

/**
 * mengubah role user
 */

export const updateUserRole = async (
  userId: string,
  newRole: "admin" | "user",
) => {
  const updateUser = await repo.changeUserRole(userId, newRole);
  if (!updateUser) {
    throw new Error("User Not Found");
  }

  return updateUser;
};

/**
 * function untuk suspend dan unsuspend account user
 */

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const updateUser = await repo.toggleUserStatus(userId, isActive);
  if (!updateUser) {
    throw new Error("User Not Found");
  }

  return updateUser;
};

/**
 * function untuk menghapus user
 */

export const removeUser = async (userId: string) => {
  const deleteuser = await repo.deleteUser(userId);
  if (!deleteuser) {
    throw new Error("User Not Found");
  }

  return deleteuser;
};

export const createUser = async (data: {
  name: string;
  email: string;
  role: "admin" | "user";
  password?: string;
}) => {
  const passwordHash = await hashPassword(data.password || "defaultPassword");

  const newUser = await repo.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
};

/**
 * get all videos for admina
 */

export const getAllVideos = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  return await repo.findAllVideos(limit, offset, query.search, query.status);
};

export const getVideoDetail = async (id: string) => {
  const video = await repo.findVideoById(id);
  if (!video) {
    throw new Error("Video Not Found");
  }
  return video;
};

export const editVideo = async (id: string, data: any) => {
  const video = await repo.findVideoById(id);
  if (!video) {
    throw new Error("Video Not Found");
  }
  return await repo.updateVideo(id, data);
};

export const removeVideo = async (id: string, isHard: boolean = false) => {
  let video;
  
  if (isHard) {
    video = await repo.findVideoById(id);
    if (!video) {
      throw new Error("Video Not Found");
    }
    // Hard delete dari DB
    await repo.hardDeleteVideo(id);
  } else {
    // Soft delete
    video = await repo.softDeleteVideo(id);
    if (!video) {
      throw new Error("Video Not Found");
    }
  }
  
  // Invalidate user videos cache
  try {
    const keys = await redisCache.keys("cache:videos:*");
    if (keys.length > 0) {
      await redisCache.del(keys);
      console.log(`[CACHE INVALIDATED] Berhasil menghapus cache list videos (${isHard ? 'Hard' : 'Soft'} Delete)`);
    }
    // Hapus juga cache detail video jika ada
    await redisCache.del(`cache:video:${id}`);
  } catch (err) {
    console.error("Gagal menghapus cache:", err);
  }

  return video;
};
