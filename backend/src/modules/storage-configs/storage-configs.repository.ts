import { eq, desc } from "drizzle-orm";
import { db } from "../../loaders";
import { storageConfigs } from "../../../drizzle/schema";
import {
  CreateStorageConfigInput,
  UpdateStorageConfigInput,
} from "./storage-configs.schema";

// ============================================
// REPOSITORY: Storage Configs
// ============================================

/**
 * Membuat konfigurasi penyimpanan baru
 * Kita buang 'secretKey' dari Zod schema dan ganti dengan 'secretKeyEnc'
 */
export const create = async (
  data: Omit<CreateStorageConfigInput, "secretKey"> & {
    secretKeyEnc: string;
    createdBy?: string;
  },
) => {
  const result = await db.insert(storageConfigs).values(data).returning();
  return result[0];
};

/**
 * Mengambil semua konfigurasi (diurutkan dari yang terbaru)
 */
export const findAll = async () => {
  return await db
    .select()
    .from(storageConfigs)
    .orderBy(desc(storageConfigs.createdAt));
};

/**
 * Mengambil satu konfigurasi berdasarkan ID
 */
export const findById = async (id: string) => {
  const result = await db
    .select()
    .from(storageConfigs)
    .where(eq(storageConfigs.id, id));
  return result[0];
};

/**
 * Memperbarui data konfigurasi
 */
export const update = async (
  id: string,
  data: Omit<UpdateStorageConfigInput, "secretKey"> & {
    secretKeyEnc?: string;
  },
) => {
  const result = await db
    .update(storageConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(storageConfigs.id, id))
    .returning();
  return result[0];
};

/**
 * Menghapus konfigurasi secara permanen
 */
export const remove = async (id: string) => {
  const result = await db
    .delete(storageConfigs)
    .where(eq(storageConfigs.id, id))
    .returning();
  return result[0];
};
