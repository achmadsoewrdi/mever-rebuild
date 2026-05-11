import * as repo from "./quality-presets.repository";
import {
  CreateQualityPresetInput,
  UpdateQualityPresetInput,
} from "./quality-presets.schema";

// ============================================
// SERVICE: Quality Presets
// ============================================

/**
 * Logika bisnis untuk membuat preset baru
 */
export const createPreset = async (
  data: CreateQualityPresetInput,
  userId?: string,
) => {
  return await repo.create({ ...data, createdBy: userId });
};

/**
 * Mengambil semua preset kualitas
 */
export const getAllPresets = async () => {
  return await repo.findAll();
};

/**
 * Mengambil satu preset berdasarkan ID
 */
export const getPresetById = async (id: string) => {
  const preset = await repo.findById(id);

  if (!preset) {
    throw new Error("Preset tidak ditemukan");
  }

  return preset;
};

/**
 * Memperbarui data preset kualitas
 */
export const updatePreset = async (
  id: string,
  data: UpdateQualityPresetInput,
) => {
  // Validasi: Pastikan preset yang mau diupdate itu ada datanya
  const existingPreset = await repo.findById(id);
  if (!existingPreset) {
    throw new Error("Preset tidak ditemukan");
  }

  return await repo.update(id, data);
};

/**
 * Menghapus preset kualitas secara permanen
 */
export const deletePreset = async (id: string) => {
  const existingPreset = await repo.findById(id);
  if (!existingPreset) {
    throw new Error("Preset tidak ditemukan");
  }

  return await repo.remove(id);
};
