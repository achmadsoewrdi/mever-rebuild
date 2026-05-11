import { eq, desc } from "drizzle-orm";
import { db } from "../../loaders";
import { qualityPresets } from "../../../drizzle/schema";
import {
  CreateQualityPresetInput,
  UpdateQualityPresetInput,
} from "./quality-presets.schema";

// ============================================
// REPOSITORY: Quality Presets
// ============================================

/**
 * Membuat preset kualitas baru
 */
export const create = async (
  data: CreateQualityPresetInput & { createdBy?: string },
) => {
  const result = await db.insert(qualityPresets).values(data).returning();

  return result[0];
};

/**
 * Mengambil semua preset kualitas (diurutkan dari yang terbaru)
 */
export const findAll = async () => {
  return await db
    .select()
    .from(qualityPresets)
    .orderBy(desc(qualityPresets.createdAt));
};

/**
 * Mengambil satu preset berdasarkan ID
 */
export const findById = async (id: string) => {
  const result = await db
    .select()
    .from(qualityPresets)
    .where(eq(qualityPresets.id, id));

  return result[0];
};

/**
 * Memperbarui data preset kualitas
 */
export const update = async (id: string, data: UpdateQualityPresetInput) => {
  const result = await db
    .update(qualityPresets)
    .set({ ...data, updatedAt: new Date() }) // Otomatis perbarui timestamp updatedAt
    .where(eq(qualityPresets.id, id))
    .returning();

  return result[0];
};

/**
 * Menghapus preset kualitas secara permanen (Hard Delete)
 */
export const remove = async (id: string) => {
  const result = await db
    .delete(qualityPresets)
    .where(eq(qualityPresets.id, id))
    .returning();

  return result[0];
};
