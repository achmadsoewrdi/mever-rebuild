import * as repo from "./admin.repository";
import { hashPassword } from "../../utils/hash";
import { redisCache } from "../../loaders";
import { getActiveConfigDecrypted, getConfigById } from "../storage-configs/storage-configs.service";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { decrypt } from "../../utils/encrypt";
import { sendAccountApprovedEmail, sendAccountRejectedEmail } from "../../utils/mailjet";
import { generateRandomPassword } from "../../utils/password";

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

    // 1. Delete physical files from MinIO / S3
    try {
      if (video.storageConfigId) {
        const config = await getConfigById(video.storageConfigId);
        const secretKey = decrypt(config.secretKeyEnc!);
        
        let endpoint = config.endpointUrl!;
        if (!endpoint.startsWith("http")) endpoint = `https://${endpoint}`;

        const s3Client = new S3Client({
          region: "us-east-1",
          endpoint,
          credentials: {
            accessKeyId: config.accessKey!,
            secretAccessKey: secretKey,
          },
          forcePathStyle: true,
        });

        // Hapus file mentah di bucket input
        if (video.sourcePath) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: config.bucketInput!,
            Key: video.sourcePath
          })).catch(err => console.error("Gagal hapus raw video:", err.message));
        }

        // Hapus semua folder output (hls, dash, mp4) di bucket output
        // Prefix yang di-generate oleh transcoder adalah: videos/{slug}/
        if (video.slug) {
          const prefix = `videos/${video.slug}/`;
          let isTruncated = true;
          let continuationToken: string | undefined = undefined;

          while (isTruncated) {
            const listParams: any = { Bucket: config.bucketOutput!, Prefix: prefix };
            if (continuationToken) listParams.ContinuationToken = continuationToken;
            
            const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));
            if (listedObjects.Contents && listedObjects.Contents.length > 0) {
              const deleteParams = {
                Bucket: config.bucketOutput!,
                Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
              };
              await s3Client.send(new DeleteObjectsCommand(deleteParams));
            }
            isTruncated = listedObjects.IsTruncated ?? false;
            continuationToken = listedObjects.NextContinuationToken;
          }
          console.log(`[STORAGE] Berhasil menghapus semua aset fisik dari: ${prefix}`);
        }
      }
    } catch (s3Error) {
      console.error("[STORAGE] Gagal menghapus file fisik di storage:", s3Error);
      // Lanjutkan menghapus dari DB meskipun file gagal dihapus (misal: storage mati)
    }

    // 2. Hard delete dari DB (cascades manually to assets & jobs)
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

/**
 * =====================
 * Account Requests
 * =====================
 */

export const fetchAccountRequests = async (query: { status?: string }) => {
  return await repo.getAccountRequests(query.status);
};

export const approveAccountRequest = async (id: string) => {
  const request = await repo.getAccountRequestById(id);
  if (!request) throw new Error("Request Not Found");
  if (request.status !== "pending") throw new Error("Request is not pending");

  // Periksa apakah email sudah digunakan
  const existingUsers = await repo.getAllUser();
  if (existingUsers.find(u => u.email === request.email)) {
    throw new Error("Email already registered");
  }

  const plainPassword = generateRandomPassword(8);
  const passwordHash = await hashPassword(plainPassword);

  // Buat User Baru
  const newUser = await repo.createUser({
    name: request.name,
    email: request.email,
    role: "user", // Akun yang disetujui defaultnya adalah user biasa
    passwordHash: passwordHash
  });

  // Update Status Request
  await repo.updateAccountRequestStatus(id, "approved");

  // Kirim Email via Mailjet
  await sendAccountApprovedEmail(request.email, request.name, plainPassword);

  return newUser;
};

export const rejectAccountRequest = async (id: string) => {
  const request = await repo.getAccountRequestById(id);
  if (!request) throw new Error("Request Not Found");
  if (request.status !== "pending") throw new Error("Request is not pending");

  const updatedRequest = await repo.updateAccountRequestStatus(id, "rejected");

  // Kirim Email via Mailjet
  await sendAccountRejectedEmail(request.email, request.name);

  return updatedRequest;
};
